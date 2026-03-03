# Post-Mortem: Fixing Google Drive Upload Timeouts

## The Incident
During testing, users reported that uploading large presentation files (e.g., 25MB slide decks for faculty materials) would cause the frontend to display a "Network Error" after exactly 30 seconds. Surprisingly, checking the Google Drive interface 5 minutes later revealed that the file *did* eventually upload successfully.

## Root Cause Analysis
We traced the issue to a misalignment of timeouts across the frontend-backend-Google API chain.

1. **Frontend (Axios):** The Axios instance configured in the React app had a hardcoded `timeout: 30000` (30 seconds).
2. **Backend (Express):** Multer successfully buffered the 25MB file into RAM, and passed it to `StorageService.saveFile()`.
3. **Google Drive API:** The `googleapis` Node module streams the buffer up to Google. Depending on the server's outbound bandwidth to GCP, a 25MB file could take 45-60 seconds.

Because the Google Drive upload took 45 seconds, the frontend's Axios request gave up and threw a Network Error at the 30-second mark. The backend, unaware that the frontend disconnected, happily continued uploading the file to Google Drive. Once finished, it attempted to return a HTTP 201 response to a closed socket.

## The Fix
1. **Frontend Adjustment:** We increased the Axios `timeout` threshold for multipart/form-data requests to `120000` (2 minutes).
2. **UX Improvement:** We implemented a simulated loading progress bar on the `UploadMaterial` modal. While we cannot get exact byte-for-byte stream progress from the backend-to-Google leg, the frontend UI now explicitly asks the user to "Please wait, uploading to cloud..." and disables the submit button to prevent duplicate submissions while the connection hangs open.

## Future Recommendations
If upload times become a severe bottleneck again, we should refactor the upload architecture:
Instead of `Frontend -> Backend -> Google Drive`, we should implement **Direct-to-Cloud Uploads**. The backend would generate a secure, temporary Upload URL from the Google Drive SDK, pass it to the frontend, and the frontend would stream the file directly from the user's browser to Google's servers.
