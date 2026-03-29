// export const generateSlots = (start, end, duration) => {
//     const slots = [];

//     let [sh, sm] = start.split(":").map(Number);
//     let [eh, em] = end.split(":").map(Number);

//     const current = new Date();
//     current.setHours(sh, sm, 0);

//     const endTime = new Date();
//     endTime.setHours(eh, em, 0);

//     while (current < endTime) {
//         const time = current.toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//         });

//         slots.push(time);

//         current.setMinutes(current.getMinutes() + duration);
//     }

//     return slots;
// };











export const generateSlots = (startHour = 9, endHour = 17, interval = 15) => {
    const slots = [];

    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += interval) {
            const time = `${String(h).padStart(2, "0")}:${String(m).padStart(
                2,
                "0"
            )}`;

            slots.push(time);
        }
    }

    return slots;
};

