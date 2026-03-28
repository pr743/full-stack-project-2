import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },

    area: {
      type: String,
      trim: true,
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },


    slotDuration: {
      type: Number,
      default: 15,
    },

    maxPatientsPerDay: {
      type: Number,
      default: 50,
    },

    emergencySupport: {
      type: Boolean,
      default: true,
    },

    aiInsights: {
      type: [String],
      default: [],
    },





  },
  { timestamps: true }
);

export default mongoose.model("Hospital", hospitalSchema);