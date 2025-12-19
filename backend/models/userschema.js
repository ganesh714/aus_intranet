import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Common for ALL
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: [
        "Student",
        "Faculty",
        "HOD",
        "Dean",
        "Leadership",
        "SuperAdmin"
      ],
      required: true
    },

    // -------------------------
    // ROLE-SPECIFIC FIELDS
    // -------------------------

    student: {
      studentId: String,
      department: String,
      cgpa: Number,
      year: Number
    },

    faculty: {
      facultyId: String,
      department: String,
      qualification: String,
      experience: Number
    },

    hod: {
      hodId: String,
      department: String,
      experience: Number
    },

    dean: {
      deanId: String,
      qualification: String
    },

    leadership: {
      designation: String
    },

    superAdmin: {
      permissions: [String]
    },

    // -------------------------
    // COMMON META
    // -------------------------
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model(
  "Aususers",
  userSchema,
  "Aususers"   // 👈 FORCE collection name
);

