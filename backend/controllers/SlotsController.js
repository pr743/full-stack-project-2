import Slot from "../models/slotModel.js";
import { generateSlots } from "../utils/generateSlots.js";

export const createSlotsForDay = async (doctorId, date) => {
    const times = generateSlots();

    const bulk = times.map((t) => ({
        doctor: doctorId,
        date,
        time: t,
        capacity: 3,
        booked: 0,
    }));

    try {
        await Slot.insertMany(bulk, { ordered: false });
    } catch (err) {
        console.error("Error creating slots:", err);
    }
};