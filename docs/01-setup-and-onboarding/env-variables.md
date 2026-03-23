# Environment Variables Guide

> **For beginners:** Environment variables are like a secret config file that holds sensitive information (passwords, API keys) so they never get accidentally pushed to GitHub.

> [!CAUTION]
> **Never commit `.env` to Git.** It is already listed in `.gitignore`. If you accidentally push it, rotate all secrets immediately.

---

## Backend `.env` — `backend/.env`

Create this file by copying `backend/.env.example` (if it exists) or by creating it manually.

### Full Variable Reference

| Variable           | Required                   | Example Value                                                 | What It Does                                                              |
| ------------------ | -------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `MONGODB_URI`      | ✅                         | `mongodb+srv://user:pass@cluster.mongodb.net/aditya_intranet` | Main database connection string. **Must be named `MONGODB_URI`** exactly. |
| `MONGODB_PROD_URI` | Only for `npm run sync-db` | `mongodb+srv://...`                                           | Production database (source for the sync script)                          |
| `MONGODB_STAG_URI` | Only for `npm run sync-db` | `mongodb+srv://...`                                           | Staging database (target for the sync script)                             |
| `PORT`             | ❌ (defaults to 5001)      | `5001`                                                        | Port the backend server listens on                                        |
| `JWT_SECRET`       | ✅                         | `a_long_random_string_here_min_32_chars`                      | Used to sign and verify login tokens. **Use a long random string.**       |
| `JWT_EXPIRES_IN`   | ❌ (defaults to `7d`)      | `7d`                                                          | How long login tokens stay valid                                          |
| `STORAGE_TYPE`     | ✅                         | `LOCAL` or `DRIVE`                                            | Controls where uploaded files go. See Storage section below.              |
| `MAILTRAP_USER`     | ✅ for email               | from mailtrap.io dashboard                                    | Username for the Mailtrap email interceptor                               |
| `MAILTRAP_PASSWORD` | ✅ for email               | from mailtrap.io dashboard                                    | Password for the Mailtrap email interceptor                               |
| `GOOGLE_EMAIL`      | ✅ for email               | from Google account Settings                                  | Gmail address for sending notifications                                   |
| `GOOGLE_PASS`       | ✅ for email               | from App Passwords                                            | App-specific password for Gmail                                           |
| `GOOGLE_DRIVE_FOLDER_ID` | ✅ for DRIVE storage | ID from folder URL                                            | The root folder where all uploads will be stored                          |
```

> [!WARNING]
> The variable is `MONGODB_URI` — **not** `MONGO_URI`. Using the wrong name means the server will silently fail to connect and crash on startup.

---

### Storage Mode Explained

The `STORAGE_TYPE` variable controls which storage adapter is loaded.

```mermaid
flowchart LR
    ENV["STORAGE_TYPE=?"]
    ENV -- "DRIVE" --> GDA["GoogleDriveAdapter\n(needs service-account-key.json)"]
    ENV -- "LOCAL" --> LSA["LocalStorageAdapter\n(saves to backend/uploads/)"]
```

| `STORAGE_TYPE` | Where Files Go                            | Requires                                                                                           |
| -------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `LOCAL`        | `backend/uploads/` folder on your machine | Nothing extra — works out of the box                                                               |
| `DRIVE`        | Google Drive cloud storage                | `service-account-key.json` in `backend/`. See [Google Drive Setup Guide](./google-drive-setup.md). |

> [!TIP]
> **For local development, always use `STORAGE_TYPE=LOCAL`.** You don't need a Google account, and files are stored instantly on disk.

---

### Minimal `.env` for Local Development

```env
MONGODB_URI=mongodb://localhost:27017/aditya_intranet
PORT=5001
JWT_SECRET=replace_this_with_a_long_secret_string_at_least_32_chars
JWT_EXPIRES_IN=7d
STORAGE_TYPE=LOCAL
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASSWORD=your_mailtrap_password
GOOGLE_EMAIL=your_email@gmail.com
GOOGLE_PASS=your_google_app_password
```

---

## Frontend — No `.env` Required Locally

The React frontend (`frontend/`) connects to the backend using a hardcoded URL in `vite.config.js`. By default it hits `http://localhost:5001`.

If you need to change this (e.g., pointing at a staging server), you can add a `.env` file inside the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5001
```

> [!NOTE]
> Vite requires all environment variables to start with `VITE_` to expose them to the React application code.
