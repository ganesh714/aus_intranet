<<<<<<< HEAD
import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    message: {
      type: String,
      required: true
    },

    // 🔗 LINKS (NEW)
    links: [
      {
        label: {
          type: String,
        },
        url: {
          type: String,
        }
      }
    ],

    targetRoles: {
      type: [String],
      enum: ["Student", "Faculty", "HOD", "Dean", "Leadership", "SuperAdmin"],
      required: true
    },

    departments: {
      type: [String],
      default: ["All"]
    },

    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "normal"
    },

    startDate: {
      type: Date,
      default: Date.now
    },

    endDate: {
      type: Date,
      default: null
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aususers",
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);
=======
// models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },

    // UPDATED: Reference the 'File' model
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        default: null
    },

    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetAudience: [{
        role: { type: String, required: true },
        subRole: { type: mongoose.Schema.Types.ObjectId, ref: 'SubRole' },
        batch: { type: String } // Added batch field
    }]
});

module.exports = mongoose.model('Announcement', announcementSchema);
>>>>>>> dfe66e3069dc2dac4650c1c8b66b6542e7e97295
