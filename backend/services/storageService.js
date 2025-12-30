// backend/services/storageService.js
const { google } = require('googleapis');
const { Readable } = require('stream'); // Updated import
require('dotenv').config();

// --- CONFIGURATION ---
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const UPLOAD_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

let driveClient;

try {
    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    driveClient = google.drive({ version: 'v3', auth: oauth2Client });
    console.log("✅ Storage Service: Google Drive (OAuth) initialized");

} catch (error) {
    console.error("❌ Storage Service Error: Could not initialize Google Drive", error.message);
}

/**
 * Uploads a file to Google Drive.
 */
const saveFile = async (fileObject) => {
    if (!driveClient) throw new Error("Storage service is not available.");

    try {
        const response = await driveClient.files.create({
            requestBody: {
                name: fileObject.originalname,
                parents: [UPLOAD_FOLDER_ID],
            },
            media: {
                mimeType: fileObject.mimetype,
                // Using Readable.from is more stable for buffers than PassThrough
                body: Readable.from(fileObject.buffer),
            },
            fields: 'id',
        });

        console.log(`[Storage] File saved. ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error("[Storage] Upload failed:", error.message);
        throw error;
    }
};

/**
 * Deletes a file from Google Drive.
 */
const deleteFile = async (fileId) => {
    if (!driveClient || !fileId) return;

    try {
        await driveClient.files.delete({ fileId: fileId });
        console.log(`[Storage] File deleted. ID: ${fileId}`);
    } catch (error) {
        console.error(`[Storage] Delete failed for ID ${fileId}:`, error.message);
    }
};

/**
 * Fetches a file stream from Google Drive (for Proxying).
 */
const getFileStream = async (fileId) => {
    if (!driveClient) throw new Error("Storage service is not available.");

    try {
        const response = await driveClient.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return response.data;
    } catch (error) {
        console.error(`[Storage] Error fetching file ${fileId}:`, error.message);
        throw error;
    }
};

module.exports = { saveFile, deleteFile, getFileStream };