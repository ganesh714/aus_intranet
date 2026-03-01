# Common Errors & Troubleshooting

This document outlines common issues developers face when running the Aditya University Intranet Portal stack locally, and how to resolve them quickly.

## 1. MongoDB Connection Refused (`MongoError: connect ECONNREFUSED`)
**Symptoms:** The backend crashes immediately on startup.
**Cause:** Your local MongoDB instance is not running, or the port in `.env` is incorrect.
**Fix:** 
1. Open your terminal and run `mongosh` or check if the MongoDB service is active.
2. If using Windows, open Services and ensure "MongoDB Server" is "Running".
3. Check `backend/.env` and ensure `MONGO_URI=mongodb://localhost:27017/aditya_intranet`.

## 2. JWT Verification Failed (`401 Unauthorized`)
**Symptoms:** The frontend successfully logs in, but every subsequent request returns an error.
**Cause:** The token is expiring instantly, the `JWT_SECRET` in `.env` has changed and invalidated all previous sessions, or the frontend is failing to attach the `Authorization` header.
**Fix:**
1. Check the Axios interceptor in the frontend to ensure `config.headers.Authorization = 'Bearer ' + sessionStorage.getItem('token')` is executing properly.
2. Verify the `JWT_SECRET` string in your backend `.env` matches the server environment.

## 3. Multer "Unexpected Field" Error
**Symptoms:** Uploading a PDF returns a 500 error from the server.
**Cause:** The frontend `FormData` key does not perfectly match the key the backend `multer` middleware is expecting.
**Fix:**
If `backend/routes/materialRoutes.js` explicitly defines `upload.single('documentFile')`, your frontend React code MUST append the file using exact string matching:
```javascript
const formData = new FormData();
formData.append('documentFile', fileInput); // THIS string must match Multer's expectation exactly.
```

## 4. Vite "Cannot find module" (`Error: Cannot find module 'react-icons/fa'`)
**Symptoms:** Running `npm run dev` in the frontend fails with missing modules.
**Cause:** Dependencies changed on GitHub, and your local `node_modules` folder is out of sync.
**Fix:**
```bash
cd login
npm install
```

## 5. Backend Crashes on Boot (Third-Party Mailer Initialization)
**Symptoms:** `npm run dev` in the backend throws an error pointing to `EmailService.js` and refuses to start.
**Cause:** `server.js` automatically calls `emailService.init();` on boot. If your `.env` is missing the required SendGrid or Nodemailer API keys, the initialization fails fatally.
**Fix:**
1. Check `backend/package.json` to see if the team is currently utilizing `@sendgrid/mail` or `nodemailer`.
2. Ensure the corresponding keys (`SENDGRID_API_KEY` or `MAILTRAP_USER`/`PASS`) are populated in your `backend/.env`.
3. If you are just working on UI and don't care about emails, you can temporarily comment out `emailService.init()` in `server.js` (but do not commit this change!).
