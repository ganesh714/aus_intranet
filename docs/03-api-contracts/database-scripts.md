# Database Scripts

This document explains the CLI scripts available under `backend/scripts/` for database operations.

---

## `sync-db.js` — Production → Staging Database Sync

**Command:**
```bash
npm run sync-db
```

### Purpose
Clones the entire Production MongoDB database into the Staging database. This is useful when developers need a realistic dataset for testing against current production data.

### Required Environment Variables

| Variable | Description |
| :--- | :--- |
| `MONGODB_PROD_URI` | Connection string for the **Production** database (source). |
| `MONGODB_STAG_URI` | Connection string for the **Staging** database (target). |

> [!CAUTION]
> This script **drops all existing collections** in the staging database before copying. Any data only present in staging will be permanently lost.

### Safety Guards

The script includes multiple layers of protection to prevent accidental data loss:

1. **URI Name Validation**
   - `MONGODB_PROD_URI` must contain `"prod"` in the database name.
   - `MONGODB_STAG_URI` must contain `"test"` or `"stag"` in the database name.
   - If either check fails, the script **aborts immediately**.

2. **Duplicate URI Detection**
   - If both URIs point to the **same database**, the script refuses to run.

3. **Interactive Confirmation**
   - Before any data is touched, a warning box is displayed showing the exact source and target database names.
   - The user must type `YES` (exact match) to proceed.

### What It Does (Step by Step)

1. Validates environment variables and database names.
2. Prompts the user for explicit `YES` confirmation.
3. Connects to both Production and Staging databases.
4. Drops all non-system collections in the Staging database.
5. Iterates over every Production collection:
   - Copies indexes first.
   - Copies documents in batches of 1,000 to manage memory.
6. Closes both connections and exits.

### Example Output
```
╔══════════════════════════════════════════════════╗
║           ⚠️  DATABASE SYNC WARNING ⚠️           ║
╠══════════════════════════════════════════════════╣
║  SOURCE (prod) : intranet_db_prod              ║
║  TARGET (stag) : intranet_db_test              ║
╠══════════════════════════════════════════════════╣
║  This will WIPE ALL DATA in the target database ║
║  and replace it with data from the source.      ║
╚══════════════════════════════════════════════════╝

Type "YES" to proceed: YES

⏳ Connecting to databases...
✅ Connected successfully to both production and staging databases.

🧹 Cleaning the staging database...
  -> Dropped collection: users
  -> Dropped collection: announcements
✅ Staging database cleaned.

📦 Fetching collections from production...

⏳ Processing collection: users
  -> Copied 2 indexes.
  -> Successfully copied 150 documents.

🎉 Database copy from Production to Staging completed successfully!
🔌 Closing database connections...
```
