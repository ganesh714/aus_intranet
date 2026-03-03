# 0002: Google Drive Integration via StorageAdapter

* **Date:** 2026-03-01
* **Status:** Accepted

## Context
The intranet needs a robust, cost-effective storage medium to host thousands of lecture materials, timetables, proof-of-achievement files, and announcement attachments. Storing binary data directly in MongoDB is highly inefficient (GridFS introduces complexity we don't need initially), and hosting files on the physical local server disk poses a massive data loss risk in the event of hardware failure.

Furthermore, we require high availability and an easy way to manage quotas.

## Decision
We decided to use the **Google Drive SDK** as our primary cloud storage provider. We implemented this via a `GoogleDriveAdapter.js` under `aus_intranet/backend/adapters/`.

Crucially, rather than hardcoding Google Drive API calls into all our controllers, we decided to implement the **Adapter Pattern**. 
The application controllers rely purely on a generalized interface (`StorageAdapter`). A `localStorageAdapter` is also included to allow developers to work offline or without GCP keys.

## Consequences

* **Pros:**
  * Free/low-cost massive storage leveraging existing Google Workspace infrastructure.
  * Files are easily accessible/auditable by administrators logging directly into the Google Drive UI, independent of the intranet frontend.
  * Due to the Adapter Pattern, switching to AWS S3 or Azure later will require zero changes to our API endpoints.
* **Cons:**
  * Requires managing and rotating a `service-account-key.json` file securely.
  * The SDK calls can be slightly slower than a high-performance dedicated S3 bucket due to Drive's rate limits and permission checking overhead.
  * File IDs returned by Google Drive are opaque strings rather than predictable URLs, necessitating that our frontend rely exclusively on the `{ fileId }` tracking returned by our backend index.
