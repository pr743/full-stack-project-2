import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
    {
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },

        date: {
            type: String,
            required: true,
        },

        time: {
            type: String,
            required: true,
        },

        capacity: {
            type: Number,
            default: 4,
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