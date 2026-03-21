import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";

// export const bookAppointment = async (req, res) => {
//   try {
//     const {
//       hospitalId,
//       doctorId,
//       appointmentDate,
//       reason,
//       appointmentType,
//       slotTime,
//     } = req.body;

//     if (!hospitalId || !doctorId || !appointmentDate || !appointmentType) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Missing required fields" });
//     }

//     const doctor = await Doctor.findById(doctorId);
//     const patient = await Patient.findOne({ user: req.user._id });

//     if (!doctor || !patient) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Doctor or Patient not found" });
//     }

//     const start = new Date(appointmentDate);
//     start.setUTCHours(0, 0, 0, 0);
//     const end = new Date(appointmentDate);
//     end.setUTCHours(23, 59, 59, 999);

//     let token, queueNumber, waitTime, finalSlotTime;

//     const cleanType = appointmentType.trim().toLowerCase();

//     if (cleanType === "normal") {
//       const lastAppt = await Appointment.findOne({
//         doctor: doctorId,
//         appointmentDate: { $gte: start, $lte: end },
//         appointmentType: "normal",
//         status: { $ne: "cancelled" },
//       }).sort({ token: -1 });

//       token = lastAppt && lastAppt.token > 0 ? lastAppt.token + 1 : 1;
//       queueNumber = token;
//       waitTime = token * (doctor.avgConsultTime || 15);
//       finalSlotTime = slotTime;
//     } else {
//       token = 0;
//       queueNumber = 0;
//       waitTime = 0;
//       finalSlotTime = "EMERGENCY";
//     }

//     const appointment = await Appointment.create({
//       patient: patient._id,
//       doctor: doctor._id,
//       hospital: hospitalId,
//       appointmentDate: start,
//       slotTime: finalSlotTime,
//       reason,
//       appointmentType: cleanType, // Save the cleaned version
//       token,
//       queueNumber,
//       estimatedWaitTime: waitTime,
//       status: "booked",
//     });

//     await Doctor.findByIdAndUpdate(doctorId, { $inc: { currentPatients: 1 } });

//     return res.status(200).json({
//       success: true,
//       message: "Appointment booked successfully",
//       token: appointment.token,
//       queueNumber: appointment.queueNumber,
//       waitTime: appointment.estimatedWaitTime,
//       data: appointment,
//     });
//   } catch (error) {
//     console.error("Booking Error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const bookAppointment = async (req, res) => {
  try {
    const {
      hospitalId,
      doctorId,
      appointmentDate,
      reason,
      appointmentType,
      slotTime,
    } = req.body;

    const cleanType = appointmentType
      ? appointmentType.trim().toLowerCase()
      : "normal";

    // 1. EXACT DATE FIX
    // Use .toISOString() or force the date to a string to avoid timezone shifts
    const searchDate = new Date(appointmentDate);
    const start = new Date(searchDate.setUTCHours(0, 0, 0, 0));
    const end = new Date(searchDate.setUTCHours(23, 59, 59, 999));

    let token = 1;

    if (cleanType === "normal") {
      // 2. THE SEARCH (The "Second Path" Logic)
      const lastAppts = await Appointment.find({
        doctor: doctorId,
        appointmentDate: { $gte: start, $lte: end },
        appointmentType: "normal",
        status: { $ne: "cancelled" },
      })
        .sort({ token: -1 }) // Get the highest token number first
        .limit(1) // Only give us that one
        .lean(); // Faster execution

      if (lastAppts.length > 0 && lastAppts[0].token >= 1) {
        token = lastAppts[0].token + 1;
      }
    } else {
      token = 0; // Emergency
    }

    // 3. GET DOCTOR DATA (For wait time)
    const doctor = await Doctor.findById(doctorId);
    const waitTime = token * (doctor?.avgConsultTime || 15);

    // 4. FIND PATIENT
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient)
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });

    // 5. CREATE
    const newAppointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      hospital: hospitalId,
      appointmentDate: start, // Store the normalized date
      slotTime,
      reason,
      appointmentType: cleanType,
      token,
      queueNumber: token,
      estimatedWaitTime: waitTime,
      status: "booked",
    });

    // 6. UPDATE DOCTOR
    await Doctor.findByIdAndUpdate(doctorId, { $inc: { currentPatients: 1 } });

    // 7. RESPONSE (Flattened)
    res.status(200).json({
      success: true,
      message: "Booked!",
      token: newAppointment.token, // Send this explicitly
      queueNumber: newAppointment.queueNumber,
      waitTime: newAppointment.estimatedWaitTime,
      data: newAppointment,
    });
  } catch (error) {
    console.error("LOGIC ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDoctorAppointment = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Doctors only",
      });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
    })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const getAllAppointment = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admins only",
      });
    }

    const hospital = await Hospital.findOne({ admin: req.user._id });

    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: "Admin has no hospital",
      });
    }

    const appointments = await Appointment.find({
      hospital: hospital._id,
    })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .populate({
        path: "doctor",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a completed appointment",
      });
    }

    appointment.status = "cancelled";
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["booked", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID",
      });
    }
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const appointments = await Appointment.find({
      patient: patientId,
      doctor: doctor._id,
    })

      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })

      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load patient history",
    });
  }
};
