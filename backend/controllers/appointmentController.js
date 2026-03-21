import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";

// export const bookAppointment = async (req, res) => {
//   try {
//     if (req.user.role !== "patient") {
//       return res.status(403).json({
//         success: false,
//         message: "patient only",
//       });
//     }

//     const { hospitalId, appointmentDate, reason, appointmentType, doctorId } =
//       req.body;

//     if (!hospitalId || !appointmentDate || !appointmentType) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     const patient = await Patient.findOne({ user: req.user._id });

//     if (!patient) {
//       return res.status(400).json({
//         success: false,
//         message: "Patient profile not found",
//       });
//     }

//     let doctors = await Doctor.find({
//       _id: doctorId,
//       hospital: hospitalId,
//       isActive: true,
//       isOnline: true,
//     });

//     if (doctors.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No doctors available",
//       });
//     }

//     doctors.sort((a, b) => a.currentPatients - b.currentPatients);

//     const doctor = doctors[0];

//     const startOfDay = new Date(appointmentDate);
//     startOfDay.setHours(0, 0, 0, 0);

//     const endOfDay = new Date(appointmentDate);
//     endOfDay.setHours(23, 59, 59, 999);

//     const lastAppointment = await Appointment.findOne({
//       doctor: doctor._id,
//       appointmentDate: {
//         $gte: startOfDay,
//         $lte: endOfDay,
//       },
//     }).sort({ token: -1 });

//     const token = lastAppointment ? lastAppointment.token + 1 : 1;

//     const waitTime = token * doctor.avgConsultTime;

//     const appointment = await Appointment.create({
//       patient: patient._id,
//       doctor: doctor._id,
//       hospital: hospitalId,
//       appointmentDate,
//       slotTime: appointmentType === "emergency" ? "EMERGENCY" : `${token}`,
//       reason,
//       appointmentType,
//       token,
//       queueNumber: token,
//       estimatedWaitTime: waitTime,
//       status: "booked",
//     });

//     doctor.currentPatients += 1;
//     await doctor.save();

//     // return res.status(200).json({
//     //   success: true,
//     //   message: "Appointment booked",
//     //   data: appointment,
//     //   token,
//     //   waitTime,
//     //   queue: token,
//     // });

//     return res.status(200).json({
//       success: true,
//       message: "Appointment booked",
//       data: appointment,
//       token: appointment.token,
//       queueNumber: appointment.queueNumber,
//       waitTime: appointment.estimatedWaitTime,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false });
//   }
// };

export const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Patients only",
      });
    }

    const { hospitalId, doctorId, appointmentDate, reason, appointmentType } =
      req.body;

    if (!hospitalId || !doctorId || !appointmentDate || !appointmentType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Patient not found",
      });
    }

    const doctor = await Doctor.findOne({
      _id: doctorId,
      hospital: hospitalId,
      isActive: true,
      isOnline: true,
    });

    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor not available",
      });
    }

    const start = new Date(appointmentDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(appointmentDate);
    end.setHours(23, 59, 59, 999);

    const last = await Appointment.findOne({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
    }).sort({ token: -1 });

    const token = last ? last.token + 1 : 1;

    const waitTime = token * (doctor.avgConsultTime || 15);

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      hospital: hospitalId,
      appointmentDate,
      slotTime: appointmentType === "emergency" ? "EMERGENCY" : `${token}`,
      reason,
      appointmentType,
      token: token,
      queueNumber: token,
      estimatedWaitTime: waitTime,
      status: "booked",
    });

    doctor.currentPatients += 1;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Appointment booked",
      token,
      queueNumber: token,
      waitTime,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

console.log(bookAppointment);
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
