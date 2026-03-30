
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    gender: String,
    age: Number,

    isActive: {
      type: Boolean,
      default: true,
    },

    bloodGroup: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Patient", patientSchema);
