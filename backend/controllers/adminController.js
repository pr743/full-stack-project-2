import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import User from "../models/User.js";
import mongoose from "mongoose";


export const getDashboardStats = async (req, res) => {
  try {
    if (
      !req.hospitalId ||
      !mongoose.Types.ObjectId.isValid(req.hospitalId)
    ) {
      return res.status(200).json({
        success: true,
        needsHospitalSetup: true,
        data: null,
      });
    }

    const hospitalId = req.hospitalId;



    const totalDoctors = await Doctor.countDocuments({
      hospital: hospitalId,
    });

    const activeDoctors = await Doctor.countDocuments({
      hospital: hospitalId,
    }).populate({
      path: "user",
      match: { isActive: true },
    });


    const activeDoctorsList = await Doctor.find({
      hospital: hospitalId,
    }).populate("user");

    const activeDoctorsCount = activeDoctorsList.filter(
      (doc) => doc.user?.isActive
    ).length;

    const totalPatients = await Patient.countDocuments({
      hospital: hospitalId,
    });

    const totalAppointments = await Appointment.countDocuments({
      hospital: hospitalId,
    });

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        activeDoctors: activeDoctorsCount,
        totalPatients,
        totalAppointments,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
    });
  }
};
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospital: req.hospitalId })
      .populate("user", "name email isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};

export const getAllPatients = async (req, res) => {

  try {
    if (!req.hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital not found",
      })
    }
    const patients = await Patient.find({ hospital: req.hospitalId })
      .populate("user", "name email isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch patients",
    });
  }
};

export const getAllAppointments = async (req, res) => {
  if (
    !req.hospitalId ||
    !mongoose.Types.ObjectId.isValid(req.hospitalId)
  ) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor", "name email")
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};


export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated",
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};


export const deleteDoctor = async (req, res) => {
  try {
    const { userId } = req.params;

    const doctor = await Doctor.findOne({ user: userId });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await Doctor.deleteOne({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};


export const deletePatient = async (req, res) => {
  try {
    const { userId } = req.params;

    const patient = await Patient.findOne({ user: userId });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const user = await User.findById(userId);


    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Only blocked patients can be deleted",
      });
    }

    await Patient.deleteOne({ user: userId });
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
    });
  }
};


export const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }


    doctor.specialization = req.body.specialization || doctor.specialization;
    doctor.qualification = req.body.qualification || doctor.qualification;
    doctor.experience = req.body.experience || doctor.experience;
    doctor.consultationFee = req.body.consultationFee || doctor.consultationFee;
    doctor.avgConsultTime = req.body.avgConsultTime || doctor.avgConsultTime;
    doctor.dailyLimit = req.body.dailyLimit || doctor.dailyLimit;

    await doctor.save();


    await User.findByIdAndUpdate(doctor.user, {
      name: req.body.name,
      email: req.body.email,
    });

    res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      data: doctor,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};