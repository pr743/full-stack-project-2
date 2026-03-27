import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: String,
      },
    ],

    diagnosis: {
      type: String,
    },

    notes: {
      type: String,
    },


    signature: {
      type: String,
      default: "",

    },

  },
  { timestamps: true }
);

export default mongoose.model("Prescription", prescriptionSchema);
