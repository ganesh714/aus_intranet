const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { MongoClient } = require('mongodb');

// ──────────────────────────────────────────────
// Safety: Extract and validate database names
// ──────────────────────────────────────────────
function extractDbName(uri) {
    try {
        const url = new URL(uri);
        return url.pathname.replace('/', '') || null;
    } catch {
        return null;
    }
}

function validateUris(prodUri, stagUri) {
    const prodDbName = extractDbName(prodUri);
    const stagDbName = extractDbName(stagUri);

    const errors = [];

    if (!prodDbName) {
        errors.push("Could not extract database name from MONGODB_PROD_URI.");
    }
    if (!stagDbName) {
        errors.push("Could not extract database name from MONGODB_STAG_URI.");
    }

    // Guard: Prod URI must contain 'prod' in the DB name
    if (prodDbName && !prodDbName.toLowerCase().includes('prod')) {
        errors.push(
            `⚠️  MONGODB_PROD_URI database name is "${prodDbName}" — it does NOT contain "prod". Are you sure this is the production database?`
        );
    }

    // Guard: Stag URI must contain 'test' or 'stag' in the DB name
    if (stagDbName && !stagDbName.toLowerCase().includes('test') && !stagDbName.toLowerCase().includes('stag')) {
        errors.push(
            `⚠️  MONGODB_STAG_URI database name is "${stagDbName}" — it does NOT contain "test" or "stag". Are you sure this is the staging database?`
        );
    }

    // Guard: Both URIs must NOT point to the same database
    if (prodDbName && stagDbName && prodDbName === stagDbName) {
        errors.push(
            `🚨 CRITICAL: Both PROD and STAG URIs point to the SAME database "${prodDbName}"! Aborting.`
        );
    }

    return { prodDbName, stagDbName, errors };
}

function askConfirmation(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────
async function copyDatabase() {
    const prodUri = process.env.MONGODB_PROD_URI;
    const stagUri = process.env.MONGODB_STAG_URI;

    if (!prodUri || !stagUri) {
        console.error("❌ MONGODB_PROD_URI or MONGODB_STAG_URI missing in .env file");
        process.exit(1);
    }

    // ── Step 0: Validate URIs before doing anything ──
    const { prodDbName, stagDbName, errors } = validateUris(prodUri, stagUri);

    if (errors.length > 0) {
        console.error("\n🛑 URI VALIDATION FAILED:\n");
        errors.forEach((e) => console.error(`  ${e}`));
        console.error("\n❌ Fix your .env file and try again. Aborting.\n");
        process.exit(1);
    }

    // ── Step 1: Interactive confirmation ──
    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║           ⚠️  DATABASE SYNC WARNING ⚠️           ║");
    console.log("╠══════════════════════════════════════════════════╣");
    console.log(`║  SOURCE (prod) : ${prodDbName.padEnd(31)}║`);
    console.log(`║  TARGET (stag) : ${stagDbName.padEnd(31)}║`);
    console.log("╠══════════════════════════════════════════════════╣");
    console.log("║  This will WIPE ALL DATA in the target database ║");
    console.log("║  and replace it with data from the source.      ║");
    console.log("╚══════════════════════════════════════════════════╝\n");

    const answer = await askConfirmation('Type "YES" to proceed: ');
    if (answer !== "YES") {
        console.log("❌ Aborted by user.");
        process.exit(0);
    }

    const prodClient = new MongoClient(prodUri);
    const stagClient = new MongoClient(stagUri);

    try {
        console.log("\n⏳ Connecting to databases...");
        await prodClient.connect();
        await stagClient.connect();
        console.log("✅ Connected successfully to both production and staging databases.\n");

        const prodDb = prodClient.db();
        const stagDb = stagClient.db();

        // Clean Staging DB
        console.log("🧹 Cleaning the staging database...");
        const stagCollections = await stagDb.collections();
        for (const collection of stagCollections) {
            const name = collection.collectionName;
            if (name.startsWith('system.')) continue;

            await collection.drop();
            console.log(`  -> Dropped collection: ${name}`);
        }
        console.log("✅ Staging database cleaned.\n");

        // Fetch all collections from Production
        console.log("📦 Fetching collections from production...");
        const prodCollections = await prodDb.collections();

        for (const collection of prodCollections) {
            const name = collection.collectionName;
            if (name.startsWith('system.')) continue;

            console.log(`\n⏳ Processing collection: ${name}`);
            const stagCollection = stagDb.collection(name);

            // Copy Indexes first
            try {
                const indexes = await collection.indexes();
                const indexesToCreate = indexes.filter(index => index.name !== '_id_');
                if (indexesToCreate.length > 0) {
                    await stagCollection.createIndexes(indexesToCreate);
                    console.log(`  -> Copied ${indexesToCreate.length} indexes.`);
                }
            } catch (err) {
                console.warn(`  -> Could not copy indexes for ${name}. Warning: ${err.message}`);
            }

            // Copy Documents in batches to avoid high memory utilization
            const cursor = collection.find({});
            let batch = [];
            const batchSize = 1000;
            let totalInserted = 0;

            while (await cursor.hasNext()) {
                const doc = await cursor.next();
                batch.push(doc);

                if (batch.length === batchSize) {
                    await stagCollection.insertMany(batch);
                    totalInserted += batch.length;
                    batch = [];
                }
            }

            // Insert any remaining documents
            if (batch.length > 0) {
                await stagCollection.insertMany(batch);
                totalInserted += batch.length;
            }

            console.log(`  -> Successfully copied ${totalInserted} documents.`);
        }

        console.log("\n🎉 Database copy from Production to Staging completed successfully!");
    } catch (error) {
        console.error("\n❌ Error during database copy:", error);
    } finally {
        console.log("🔌 Closing database connections...");
        await prodClient.close();
        await stagClient.close();
        process.exit(0);
    }
}

copyDatabase();
