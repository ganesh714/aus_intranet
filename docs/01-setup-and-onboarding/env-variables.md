# Environment Variables

Environment variables are used to store sensitive information and configuration settings.

> **CRITICAL:** Never commit the `.env` file to version control. Always use a `.env.example` file to share the required keys with the team, but keep actual secrets local.

## Backend `.env` (`aus_intranet/backend/.env`)

These variables are required for the Express.js server to operate correctly.

| Variable Name   | Description                                                                 | Example Value                                  |
| :-------------- | :-------------------------------------------------------------------------- | :--------------------------------------------- |
| `PORT`          | The port the backend server listens on. Defaults to 5001.                   | `5001`                                         |
| `MONGO_URI`     | The connection string for your MongoDB database cluster or local instance.  | `mongodb://localhost:27017/aus_intranet_local` |
| `JWT_SECRET`    | The secret key used to sign and verify JSON Web Tokens for authentication.  | `your_super_secret_jwt_key_here`               |
| `GOOGLE_DRIVE_*`| Credentials for the Google Drive API (if using the Google Drive Adapter).   | N/A (Consult team lead)                        |

## Frontend Configuration

The React application uses Vite, which handles environment variables differently. Variables exposed to the client must be prefixed with `VITE_`.

Usually, this is handled in `vite.config.js` or a root `.env` file depending on the deployment strategy.

| Variable Name         | Description                                                        | Example Value           |
| :-------------------- | :----------------------------------------------------------------- | :---------------------- |
| `VITE_API_BASE_URL` | The base URL the frontend uses to make requests to the backend API. | `http://localhost:5001` |
