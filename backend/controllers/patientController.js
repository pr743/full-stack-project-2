import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";

export const createPatientProfile = async (req, res) => {
  try {
    const { age, gender, bloodGroup, hospital, } = req.body;


    if (!age || !gender || !hospital || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: "Age ,gender, Hospital and Blood Group are required",
      });
    }

    const profileExists = await Patient.findOne({ user: req.user._id });
    if (profileExists) {
      return res.status(400).json({
        success: false,
        message: "Profile already exists",
      });
    }

    const patient = await Patient.create({
      user: req.user._id,
      age,
      gender,
      bloodGroup,
      hospital,
    });
    res.status(201).json({
      success: true,
      message: "Patient profile created",
      data: patient,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id })
      .populate("user", "name email role")
      .populate("hospital", "name city");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPatientDashboard = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const totalAppointments = await Appointment.countDocuments({
      patient: patient._id,
    });

    const upcomingAppointments = await Appointment.countDocuments({
      patient: patient._id,
      status: "booked",
      appointmentDate: { $gte: new Date() },
    });

    const completedAppointments = await Appointment.countDocuments({
      patient: patient._id,
      status: "completed",
    });

    const totalPrescriptions = await Prescription.countDocuments({
      patient: patient._id,
    });

    res.status(200).json({
      success: true,
      data: {
        totalAppointments,
        upcomingAppointments,
        completedAppointments,
        totalPrescriptions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load patient dashboard",
      error: error.message,
    });
  }
};

export const getDoctorsForPatient = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const doctors = await Doctor.find({
      hospital: patient.hospital,
      isActive: true,
    }).populate("user", "name email");

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load doctors",
      error: error.message,
    });
  }
};

export const getHospitalsForPatient = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true }).select(
      "name city",
    );

    res.status(200).json({
      success: true,
      data: hospitals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load hospitals",
      error: error.message,
    });
  }
};

export const getDoctorsByHospital = async (req, res) => {
  try {
    const doctors = await Doctor.find({
      hospital: req.params.hospitalId,
      isActive: true
    }).populate("user", "name");

    res.status(200).json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load doctors",
      error: error.message,
    });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      slotTime,
      reason,
      appointmentType,
      hospitalId,
    } = req.body;


    if (!hospitalId || !doctorId || !appointmentDate || !reason || !appointmentType) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    if (appointmentType === "normal" && !slotTime) {
      return res.status(400).json({
        success: false,
        message: "Slot time required for normal appointment",
      });
    }

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
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
        message: "Doctor not available in selected hospital",
      });
    }



    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      hospital: hospitalId,
      appointmentDate,
      slotTime: appointmentType === "emergency" ? "EMERGENCY" : slotTime,
      reason,
      appointmentType,
      status: "booked",
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,


    });
  } catch (error) {
    console.error("BOOK APPOINTMENT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


export const getPatientAppointments = async (req, res) => {
  try {

    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({
        message: "Patient profile not found",
      });
    }


    const appointments = await Appointment.find({
      patient: patient._id,
    })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name" },
      })
      .populate("hospital", "name city")
      .sort({ createdAt: -1 });

    res.json({ data: appointments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};


export const deleteAppointment = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const appt = await Appointment.findOneAndDelete({
      _id: req.params.id,
      patient: patient._id,
    });

    if (!appt) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};