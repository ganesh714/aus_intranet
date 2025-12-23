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
