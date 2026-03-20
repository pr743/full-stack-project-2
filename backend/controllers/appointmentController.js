import { json } from "express";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import mongoose, { Query } from "mongoose";

// export const bookAppointment = async (req, res) => {
//   try {
//     if (req.user.role !== "patient") {
//       return res.status(403).json({
//         success: false,
//         message: "Patients only",
//       });
//     }

//     const { doctorId, appointmentDate, slotTime, reason, appointmentType } =
//       req.body;

//     if (
//       !doctorId ||
//       !appointmentDate ||
//       !reason ||
//       (appointmentType === "normal" && !slotTime)
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     const patient = await Patient.findOne({ user: req.user._id });

//     if (!patient) {
//       return res.status(404).json({
//         success: false,
//         message: "Patient profile not found",
//       });
//     }

//     const doctors = await Doctor.findOne({
//       _id: doctorId,
//       hospital: patient.hospital,
//       isActive: true,
//       isOnline: true,
//     });

//     if (!doctor.length) {
//       return res.status(400).json({
//         success: false,
//         message: "Doctor not available in your hospital",
//       });
//     }

//     doctor.sort((a, b) => a.currentPatients - b.currentPatients);

//     const doctor = doctor[0];

//     const lastAppointment = await Appointment.findOne({
//       doctor: doctor._id,
//       appointmentDate,
//     }).sort({ token: -1 });

//     const token = lastAppointment ? lastAppointment.token + 1 : 1;

//     const waitTime = token * doctor.avgConsultTime;

//     const newAppointment = await Appointment.create({
//       patient: patient._id,
//       doctor: doctor._id,
//       hospital: doctor.hospital,
//       appointmentDate,
//       slotTime: appointmentType === "emergency" ? "EMERGENCY" : `${token}`,
//       reason,
//       appointmentType,
//       status: "booked",
//     });

//     doctor.currentPatients += 1;

//     await doctor.save();

//     const populatedAppointment = await Appointment.findById(newAppointment._id)
//       .populate({
//         path: "patient",
//         populate: {
//           path: "user",
//           select: "name email",
//         },
//       })
//       .populate({
//         path: "doctor",
//         populate: {
//           path: "user",
//           select: "name email",
//         },
//       });

//     res.status(201).json({
//       success: true,
//       message: "Appointment booked successfully",
//       data: populatedAppointment,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to book appointment",
//     });
//   }
// };

export const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "patient only",
      });
    }

    const { hospitalId, appointmentDate, reason, appointmentType } = req.body;

    if (!hospitalId || !appointmentDate || !appointmentType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    let doctors = await Doctor.find({
      hospital: hospitalId,
      isActive: true,
      isOnline: true,
    });

    if (doctors.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No doctors available",
      });
    }

    doctors.sort((a, b) => a.currentPatients - b.currentPatients);

    const doctor = doctors[0];

    const lastAppointment = await Appointment.findOne({
      doctor: doctor._id,
      appointmentDate,
    }).sort({ token: -1 });

    const token = lastAppointment ? lastAppointment.token + 1 : 1;

    const waitTime = token * doctor.avgConsultTime;

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      hospital: hospitalId,
      appointmentDate,
      slotTime: appointmentType === "emergency" ? "EMERGENCY" : `${token}`,
      reason,
      appointmentType,
      token,
      queueNumber: token,
      estimatedWaitTime: waitTime,
      status: "booked",
    });

    doctor.currentPatients += 1;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Appointment booked",
      data: appointment,
      token,
      waitTime,
      queue: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
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
