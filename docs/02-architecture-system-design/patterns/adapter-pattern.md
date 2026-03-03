# Adapter Pattern

The **Adapter Pattern** is used heavily in the persistence layer of this system to abstract away the complexity of physical file storage.

## The Problem
Directly integrating Google Drive API calls into `materialController`, `timetableController`, and `driveController` would tightly couple the application to Google's SDK. If the university decides to migrate to AWS S3 or Azure Blob Storage in the future, developers would have to rewrite every single upload endpoint in the codebase.

Furthermore, it makes local development difficult, as every developer would need valid Google Cloud credentials to test simple file uploads.

## The Solution
We introduce an abstract class (Interface) called `StorageAdapter`, which enforces a contract for file storage operations.

1. **`LocalStorageAdapter`**: Saves files directly to the local disk (`/uploads`). Ideal for offline development and local testing.
2. **`GoogleDriveAdapter`**: Communicates with the Google Drive API (`googleapis`) to upload, stream, and delete files on the cloud.

The `StorageService` acts as a facade. During initialization, it reads the `.env` variable `STORAGE_MODE`. If it is set to `local`, it instantiates the `LocalStorageAdapter`; otherwise, it uses `GoogleDriveAdapter`. 

## How to add a new storage provider (e.g. AWS S3)
To switch to AWS S3 in the future, a developer only needs to:
1. Create `S3Adapter.js` extending `StorageAdapter`.
2. Implement `saveFile`, `deleteFile`, `getFileStream`, and `copyFile`.
3. Update `StorageService` to instantiate `S3Adapter` when `STORAGE_MODE=S3`.

**No controllers or business logic will need to be changed.**
