const { google } = require('googleapis');
const stream = require('stream');
const path = require('path');
const StorageAdapter = require('./StorageAdapter');
class GoogleDriveAdapter extends StorageAdapter {
    constructor() {
        super();
        const KEYFILEPATH = path.join(__dirname, '..', 'service-account-key.json');
        const SCOPES = ['https://www.googleapis.com/auth/drive'];

        try {
            const auth = new google.auth.GoogleAuth({
                keyFile: KEYFILEPATH,
                scopes: SCOPES,
            });
            this.driveService = google.drive({ version: 'v3', auth });
        } catch (e) {
            console.error("Google Drive Auth Failed:", e);
        }
    }
    async saveFile(fileObject) {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(fileObject.buffer);

        const { data } = await this.driveService.files.create({
            media: {
                mimeType: fileObject.mimetype,
                body: bufferStream,
            },
            requestBody: {
                name: fileObject.originalname,
                parents: ['10kPDeFq8h-FpYQyXgu8w4D7-4S8lP2zR'], // Add your Folder ID here
            },
            fields: 'id,name',
        });
        return data.id;
    }
    async deleteFile(fileId) {
        await this.driveService.files.delete({ fileId: fileId });
        return true;
    }
    async getFileStream(fileId) {
        const result = await this.driveService.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );
        return result.data;
    }
    async copyFile(fileId) {
        const { data } = await this.driveService.files.copy({
            fileId: fileId,
            requestBody: {
                parents: ['10kPDeFq8h-FpYQyXgu8w4D7-4S8lP2zR'] // Same parent
            }
        });
        return data.id;
    }
}
module.exports = GoogleDriveAdapter;
