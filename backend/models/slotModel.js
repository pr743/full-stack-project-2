import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
    {
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },

        date: {
            type: String, // format: "2026-01-24"
            required: true,
        },

        time: {
            type: String, // format: "09:00"
            required: true,
        },

        capacity: {
            type: Number,
            default: 3, // max 3 patients per slot
        },

        booked: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

slotSchema.index(
    { doctor: 1, date: 1, time: 1 },
    { unique: true }
);

export default mongoose.model("Slot", slotSchema);