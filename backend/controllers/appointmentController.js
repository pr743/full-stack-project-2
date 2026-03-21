import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";

export const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({
        success: false,
        message: "Patients only",
      });
    }

    const {
      hospitalId,
      doctorId,
      appointmentDate,
      reason,
      appointmentType,
      slotTime,
    } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(400).json({
        success: false,
        message: "Patient not found",
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor not available",
      });
    }

    const selectedDate = new Date(appointmentDate);

    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    let token = 0;
    let queueNumber = 0;
    let waitTime = 0;
    let finalSlotTime = slotTime || "";

    if (appointmentType === "emergency") {
      finalSlotTime = "EMERGENCY";
    } else {
      // 🚫 Prevent duplicate slot
      const exists = await Appointment.findOne({
        doctor: doctorId,
        appointmentDate: { $gte: start, $lte: end },
        slotTime,
        status: { $ne: "cancelled" },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Slot already booked",
        });
      }

      // ✅ COUNT BASED TOKEN (BEST)
      const count = await Appointment.countDocuments({
        doctor: doctorId,
        appointmentDate: { $gte: start, $lte: end },
        appointmentType: "normal",
        status: { $ne: "cancelled" },
      });

      token = count + 1;
      queueNumber = token;
      waitTime = token * (doctor.avgConsultTime || 15);
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      hospital: hospitalId,
      appointmentDate: selectedDate,
      slotTime: finalSlotTime,
      reason,
      appointmentType,
      token,
      queueNumber,
      estimatedWaitTime: waitTime,
      status: "booked",
    });

    await Doctor.findByIdAndUpdate(doctorId, {
      $inc: { currentPatients: 1 },
    });

    return res.status(200).json({
      success: true,
      message: "Appointment booked successfully",
      token,
      queueNumber,
      waitTime,
      data: appointment,
    });
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
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
