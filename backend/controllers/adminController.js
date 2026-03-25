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

    if (!hospitalId) {
      return res.status(200).json({
        success: true,
        needsHospitalSetup,
        data: {
          totalDoctors: 0,
          activeDoctors: 0,
          totalPatients: 0,
          totalAppointments: 0,
        },
      });
    }

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital  context not found",
      });
    }
    const totalUsers = await User.countDocuments({ hospital: hospitalId });
    const totalDoctors = await Doctor.countDocuments({ hospital: hospitalId });
    const activeDoctors = await User.countDocuments({
      hospital: hospitalId,
      role: "doctor",
      isActive: true,
    });
    const totalPatients = await Patient.countDocuments({
      hospital: hospitalId,
    });
    const totalAppointments = await Appointment.countDocuments({
      hospital: hospitalId,
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        activeDoctors,
        totalPatients,
        totalAppointments,
      },
    });
  } catch (error) {
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

// export const toggleUserStatus = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     user.isActive = !user.isActive;
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "User status updated",
//       // data: user,
//       isActive: user.isActive,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to update user status",
//     });
//   }
// };



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


