import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";
import mongoose from "mongoose";
import { generateSlots } from "../utils/generateSlots.js";
import slot from "../models/slot.js";


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

    if (!hospitalId || !doctorId || !appointmentDate || !appointmentType || !slotTime) {
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
    });

    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor not available",
      });
    }


    const selectedDate = new Date(appointmentDate);
    const day = selectedDate.getDay();

    if (day === 0 && appointmentType === "normal") {
      return res.status(400).json({
        success: false,
        message: "Hospital closed on Sunday",
      });
    }


    const start = new Date(appointmentDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(appointmentDate);
    end.setHours(23, 59, 59, 999);

    const count = await Appointment.countDocuments({
      doctor: doctorId,
      appointmentDate: { $gte: start, $lte: end },
      slotTime,
    });

    if (count >= doctor.slotCapacity) {
      return res.status(400).json({
        success: false,
        message: "Slot full, choose another time ❌",
      });
    }



    const existingAppointment = await Appointment.findOne({
      patient: patient._id,
      doctor: doctorId,
      appointmentDate,
      slotTime,
      status: { $ne: ["cancelled"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "You already have an appointment at this time",
      });
    }

    const slot = await slot.findOne({
      doctor: doctorId,
      date: appointmentDate,
      time: slotTime,
    });


    if (!slot || slot.booked >= doctor.slotCapacity) {
      return res.status(400).json({
        success: false,
        message: "Slot full, choose another time"
      });
    }


    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      hospital: hospitalId,
      appointmentDate: selectedDate,
      slotTime,
      reason,
      appointmentType,
      status: "booked",
      queueNumber: count + 1,
    });


    slot.booked += 1;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });

  } catch (error) {
    console.error(error);


    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have an appointment at this time"
      });
    }



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



export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;


    const slots = await slot.find({
      doctor: doctorId,
      date
    });


    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }


    const allSlots = generateSlots(
      doctor.workingHours.start,
      doctor.workingHours.end,
      doctor.slotDuration
    );


    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: start, $lte: end },
    });


    const slotMap = {};

    appointments.forEach((a) => {
      slotMap[a.slotTime] = (slotMap[a.slotTime] || 0) + 1;
    });

    const result = allSlots.map((slot) => {
      const booked = slotMap[slot] || 0;

      return {
        time: slot,
        booked,
        available: doctor.slotCapacity - booked,
        isFull: booked >= doctor.slotCapacity,
      };
    });

    res.json({ success: true, data: result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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


    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }


    const allowedStatus = ["booked", "in-progress", "completed", "cancelled"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }


    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(403).json({
        success: false,
        message: "Doctor not authorized",
      });
    }


    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }


    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not allowed to update this appointment",
      });
    }


    if (appointment.status === status) {
      return res.status(400).json({
        success: false,
        message: `Already ${status}`,
      });
    }


    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Already completed, cannot change",
      });
    }


    appointment.status = status;
    await appointment.save();


    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: appointment,
    });

  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
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


export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }


    if (appointment.status !== "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Only cancelled appointments can be deleted",
      });
    }

    await Appointment.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};



export const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newSlotTime } = req.body;

    if (!newDate || !newSlotTime) {
      return res.status(400).json({
        message: "Date and time required ❌",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.appointmentDate = new Date(newDate);
    appointment.slotTime = newSlotTime;

    await appointment.save();

    res.json({
      message: "Rescheduled successfully ✅",
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error ❌",
    });
  }
};

