const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { MongoClient } = require('mongodb');

async function copyDatabase() {
    const prodUri = process.env.MONGODB_PROD_URI;
    const testUri = process.env.MONGODB_TEST_URI;

    if (!prodUri || !testUri) {
        console.error("❌ MONGODB_PROD_URI or MONGODB_TEST_URI missing in .env file");
        process.exit(1);
    }

    const prodClient = new MongoClient(prodUri);
    const testClient = new MongoClient(testUri);

    try {
        console.log("⏳ Connecting to databases...");
        await prodClient.connect();
        await testClient.connect();
        console.log("✅ Connected successfully to both production and test databases.\n");

        const prodDb = prodClient.db();
        const testDb = testClient.db();

        // 1. Clean Testing DB
        console.log("🧹 Cleaning the test database...");
        const testCollections = await testDb.collections();
        for (const collection of testCollections) {
            const name = collection.collectionName;
            if (name.startsWith('system.')) continue;

            await collection.drop();
            console.log(`  -> Dropped collection: ${name}`);
        }
        console.log("✅ Test database cleaned.\n");

        // 2. Fetch all collections from Production
        console.log("📦 Fetching collections from production...");
        const prodCollections = await prodDb.collections();

        for (const collection of prodCollections) {
            const name = collection.collectionName;
            if (name.startsWith('system.')) continue;

            console.log(`\n⏳ Processing collection: ${name}`);
            const testCollection = testDb.collection(name);

            // Copy Indexes first
            try {
                const indexes = await collection.indexes();
                const indexesToCreate = indexes.filter(index => index.name !== '_id_');
                if (indexesToCreate.length > 0) {
                    await testCollection.createIndexes(indexesToCreate);
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
                    await testCollection.insertMany(batch);
                    totalInserted += batch.length;
                    batch = [];
                }
            }

            // Insert any remaining documents
            if (batch.length > 0) {
                await testCollection.insertMany(batch);
                totalInserted += batch.length;
            }

            console.log(`  -> Successfully copied ${totalInserted} documents.`);
        }

        console.log("\n🎉 Database copy from Production to Test completed successfully!");
    } catch (error) {
        console.error("\n❌ Error during database copy:", error);
    } finally {
        console.log("🔌 Closing database connections...");
        await prodClient.close();
        await testClient.close();
        process.exit(0);
    }
}

copyDatabase();
