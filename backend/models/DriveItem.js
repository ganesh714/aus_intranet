const mongoose = require('mongoose');

const driveItemSchema = new mongoose.Schema({
    // Name of the folder or file
    name: { type: String, required: true },

    // Type: 'folder' or 'file'
    type: { type: String, enum: ['folder', 'file'], required: true },

    // Parent Folder ID (null for root)
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'DriveItem', default: null },

    // Owner of this item
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // If type='file', this links to the physical File record
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
driveItemSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('DriveItem', driveItemSchema);
