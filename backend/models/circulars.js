import mongoose from "mongoose";

const circularSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    // Who can see this circular
    targetRoles: {
      type: [String],
      enum: ["Student", "Faculty", "HOD", "Dean", "Leadership"],
      required: true
    },
    // Which departments can see it
    // "All" means everyone in that role
    departments: {
      type: [String],
      default: ["All"]
    },

    // Optional file (PDF, DOC, etc.)
    attachment: {
      fileName: String,
      fileUrl: String
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Aususers", // SuperAdmin
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    expiryDate: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("Circular", circularSchema);
