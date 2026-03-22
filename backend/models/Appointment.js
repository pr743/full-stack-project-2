import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    slotTime: {
      type: String,
      required: true,
    },

    reason: String,

    appointmentType: {
      type: String,
      enum: ["normal", "emergency"],
      default: "normal",
    },

    // token: {
    //   type: Number,
    //   default: 0,
    // },

    queueNumber: {
      type: Number,
      default: 0,
    },

    estimatedWaitTime: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["booked", "completed", "cancelled"],
      default: "booked",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
