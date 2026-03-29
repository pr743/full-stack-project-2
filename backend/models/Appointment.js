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

    status: {
      type: String,
      enum: ["booked", "completed", "cancelled", "in-progress"],
      default: "booked",
    },

    queueNumber: {
      type: Number,
    },

    status: {
      type: String,
      default: "pending",
    },

  },
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
