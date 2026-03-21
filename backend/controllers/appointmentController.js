import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";

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

    const docId = new mongoose.Types.ObjectId(doctorId);
    const hospId = new mongoose.Types.ObjectId(hospitalId);

    const cleanType = appointmentType?.trim().toLowerCase() || "normal";

    const doctor = await Doctor.findById(docId);

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile missing",
      });
    }

    if (cleanType === "normal") {
      const existing = await Appointment.findOne({
        doctor: docId,
        appointmentDate: new Date(appointmentDate),
        slotTime,
        status: "booked",
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Slot already booked",
        });
      }
    }

    let token = 0;

    if (cleanType === "normal") {
      const start = new Date(appointmentDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(appointmentDate);
      end.setHours(23, 59, 59, 999);

      const lastAppt = await Appointment.findOne({
        doctor: docId,
        appointmentDate: { $gte: start, $lte: end },
        appointmentType: "normal",
      }).sort({ token: -1 });

      token = lastAppt ? lastAppt.token + 1 : 1;
    }

    const waitTime =
      cleanType === "normal" ? token * (doctor?.avgConsultTime || 15) : 0;

    const newAppointment = await Appointment.create({
      patient: patient._id,
      doctor: docId,
      hospital: hospId,
      appointmentDate: new Date(appointmentDate),
      slotTime,
      reason,
      appointmentType: cleanType,
      token,
      queueNumber: token,
      estimatedWaitTime: waitTime,
      status: "booked",
    });

    await Doctor.findByIdAndUpdate(docId, {
      $inc: { currentPatients: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment booked!",
      data: newAppointment,
    });
  } catch (error) {
    console.error("BOOKING_ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error during booking",
    });
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
