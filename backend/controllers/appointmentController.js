import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
// import TokenCounter from "../models/TokenCounter.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";

export const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ message: "Patients only" });
    }

    const {
      hospitalId,
      doctorId,
      appointmentDate,
      reason,
      appointmentType,
      slotTime,
    } = req.body;

    const type = (appointmentType || "normal").toLowerCase().trim();

    const patient = await Patient.findOne({ user: req.user._id });
    const doctor = await Doctor.findById(doctorId);

    if (!patient || !doctor) {
      return res.status(400).json({ message: "Invalid data" });
    }

    // ✅ DATE RANGE FIX
    const start = new Date(appointmentDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(appointmentDate);
    end.setHours(23, 59, 59, 999);

    let finalSlot = slotTime || "";
    let queueNumber = 0;
    let waitTime = 0;

    if (type === "emergency") {
      finalSlot = "EMERGENCY";
    } else {
      // ✅ SLOT CHECK
      const exists = await Appointment.findOne({
        doctor: doctorId,
        hospital: hospitalId,
        appointmentDate: { $gte: start, $lte: end },
        slotTime,
        status: { $ne: "cancelled" },
      });

      if (exists) {
        return res.status(400).json({ message: "Slot already booked" });
      }

      // ✅ COUNT FIX
      const total = await Appointment.countDocuments({
        doctor: doctorId,
        hospital: hospitalId,
        appointmentDate: { $gte: start, $lte: end },
        status: { $ne: "cancelled" },
      });

      queueNumber = total + 1;
      waitTime = queueNumber * (doctor.avgConsultTime || 15);
    }

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      hospital: hospitalId,
      appointmentDate: start, // ✅ SAVE NORMALIZED DATE
      slotTime: finalSlot,
      reason,
      appointmentType: type,
      queueNumber,
      estimatedWaitTime: waitTime,
      status: "booked",
    });

    res.json({
      success: true,
      data: appointment,
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: "Server error" });
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
