import Prescription from "../models/Prescription.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

export const createPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const { appointmentId, medicines, diagnosis, notes } = req.body;

    if (!appointmentId || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Appointment and medicines required",
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }



    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized doctor",

      });
    }


    if (appointment.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Only completed appointments allowed",

      });
    }



    const existing = await Prescription.findOne({ appointment: appointmentId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Prescription already exists",
      });
    }

    const prescription = await Prescription.create({
      appointment: appointment._id,
      doctor: doctor._id,
      patient: appointment.patient,
      hospital: appointment.hospital,
      medicines,
      diagnosis,
      notes,
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: prescription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create prescription",
    });
  }
};




export const getDoctorTodayAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctor: doctor._id,
      appointmentDate: { $gte: today },
      status: "completed",
    })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name" },
      })
      .sort({ appointmentDate: 1 });

    res.json({
      success: true,
      data: appointments,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
};

export const getDoctorPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    const prescriptions = await Prescription.find({
      doctor: doctor._id,
    })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load prescriptions",
    });
  }
};

export const getPatientPrescription = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    const prescriptions = await Prescription.find({
      patient: patient._id,
    })
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .populate("appointment")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load prescriptions",
    });
  }
};

export const getPatientHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient profile not found",
      });
    }

    const history = await Prescription.find({ patient: patient._id })

      .populate({
        path: "doctor",
        populate: { path: "user", select: "name" },
      })
      .populate("appointment", "date status")
      .select("diagnosis notes createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load patient history",
    });
  }
};




export const getDoctorAppointmentsForPrescription = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const appointments = await Appointment.find({
      doctor: doctor._id,
      status: "completed",
    })
      .populate({
        path: "patient",
        populate: {
          path: "user",
          select: "name email",
        },
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
      message: "Failed to fetch appointments",
    });
  }
};