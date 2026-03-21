import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import Patient from "../models/Patient.js";

export const bookAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).json({ success: false, message: "Patients only" });
    }

    const { hospitalId, doctorId, appointmentDate, reason, appointmentType } =
      req.body;

    if (!hospitalId || !doctorId || !appointmentDate || !appointmentType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res
        .status(400)
        .json({ success: false, message: "Patient not found" });
    }

    const doctor = await Doctor.findOne({
      _id: doctorId,
      hospital: hospitalId,
      isActive: true,
      isOnline: true,
    });
    if (!doctor) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor not available" });
    }

    const selectedDate = new Date(appointmentDate);
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);

    let token, queueNumber, waitTime, slotTime;

    if (appointmentType === "emergency") {
      token = 0;
      queueNumber = 0;
      waitTime = 0;
      slotTime = "EMERGENCY";
    } else {
      const last = await Appointment.findOne({
        doctor: doctor._id,
        hospital: hospitalId,
        appointmentDate: { $gte: start, $lte: end },
        appointmentType: "normal",
        token: { $gt: 0 },
        status: { $ne: "cancelled" },
      }).sort({ token: -1 });

      token = last ? last.token + 1 : 1;
      queueNumber = token;
      waitTime = token * (doctor.avgConsultTime || 15);
      slotTime = `Token #${token}`;
    }

    console.log("✅ NEW CODE | TYPE:", appointmentType, "| TOKEN:", token);

    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctor._id,
      hospital: hospitalId,
      appointmentDate: new Date(appointmentDate),
      slotTime,
      reason,
      appointmentType,
      token,
      queueNumber,
      estimatedWaitTime: waitTime,
      status: "booked",
    });

    doctor.currentPatients += 1;
    await doctor.save();

    return res.status(200).json({
      success: true,
      message: "Appointment booked successfully",
      token,
      queueNumber,
      waitTime,
      slotTime,
      data: appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
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
