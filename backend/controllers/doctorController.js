import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const createDoctor = async (req, res) => {
  try {
    if(!req.user || req.user.role !== "admin"){
      return res.status(403).json({
        success:false,
        message:"Admin only",
      });
 
    }


    const hospital = await Hospital.findOne({ admin: req.user._id });

    if(!hospital){
      return res.status(400).json({
        success:false,
        message:"Admin has no hospital Add  hospital first"
      })
    }
    const {
      name,
      email,
      password,
      specialization,
      qualification,
      experience,
      consultationFee,
      avgConsultTime,
      dailyLimit,
    } = req.body;


    if (!name || !email || !password || !specialization || !consultationFee) {
      return res
        .status(400)
        .json({ success: false, message: "Required fields missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctorUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    const doctor = await Doctor.create({
      user: doctorUser._id,
      specialization,
      qualification,
      experience,
      consultationFee,
      avgConsultTime,
      dailyLimit,
      hospital: hospital._id,   
      createdBy: req.user._id,
      isActive:true,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message,
    });
  }
};

export const getDoctorDashboard = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({
      user: req.user._id,
      isActive: true,
    });

    if (!doctor) {
      return res
      .status(404)
    .json({ success: false, message: "Doctor profile not found" });
    }

  




    const appointments = await Appointment.find({
      doctor: doctor._id
    });

  

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const todayAppointment = await Appointment.countDocuments({
      doctor: doctor._id,
      appointmentDate: { $gte: start, $lte: end },
    });

    const pendingAppointment = await Appointment.countDocuments({
      doctor: doctor._id,
      status: "booked",
    });
    const completedAppointment = await Appointment.countDocuments({
      doctor: doctor._id,
      status: "completed",
    });
    const patients = await Appointment.distinct("patient", {
      doctor: doctor._id,
    });





    res.status(200).json({
      success: true,
      data: {
        todayAppointment,
        pendingAppointment,
        completedAppointment,
        totalPatients: patients.length,
        hospitalId: doctor.hospital?._id || null,
      },
    });
  } catch (error) {
    console.error("Doctor dashboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load doctor dashboard" });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor profile not found" });

    const appointments = await Appointment.find({
      doctor: doctor._id,
      hospital: doctor.hospital,
    })
      .populate({
        path: "patient",
        populate: { path: "user", select: "name email" },
      })
      .sort({ appointmentDate: 1 });

    res
      .status(200)
      .json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load appointments" });
  }
};

export const completeAppointment = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, message: "Doctor profile not found" });

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: doctor._id,
      hospital: doctor.hospital,
    });
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    appointment.status = "completed";
    await appointment.save();

    res
      .status(200)
      .json({ success: true, message: "Appointment marked as completed" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update appointment" });
  }
};





export  const getDoctorProfile = async (req,res) =>{
  try {
  const doctor = await Doctor.findOne({user:req.user._id})
       .populate("user","name email")
       .populate("hospital","name address");


    if(!doctor){
      return res.status(404).json({
        success:false,
        message:"Doctor profile not found",
      });
    } 
    
    res.status(200).json({
      success:true,
      data:doctor,
    });

  } catch (error) {
    return res.status(500).json ({
      success:false,
      message:"Failed to load doctor profile",
    });
  }
}



export const updateDoctorProfile = async (req,res) =>{
  try {
  const doctor = await Doctor.findOne({user:req.user._id});  

  if(!doctor){
    return res.status(404).json({
      success:false,
      message:"Doctor profile not found",
    });
  }


  const{
    specialization,
    qualification,
    experience,
    consultationFee,
    avgConsultTime,
    dailyLimit,

  } = req.body;


  doctor.specialization = specialization || doctor.specialization;
  doctor.qualification = qualification || doctor.qualification;
  doctor.experience = experience || doctor.experience;
  doctor.consultationFee = consultationFee || doctor.consultationFee;
  doctor.avgConsultTime = avgConsultTime || doctor.avgConsultTime;
  doctor.dailyLimit = dailyLimit || doctor.dailyLimit;  

  await doctor.save();

  res.status(200).json({
    success:true,
    message:"Doctor profile updated successfully",
    data:doctor,
  })
    
  } catch (error) {
    console.error("Error updating doctor profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update doctor profile",
    });
  }
}
export const nextPatient = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).json({
        success: false,
        message: "Doctors only",
      });
    }

    const doctor = await Doctor.findOne({ user: req.user._id });

    const next = await Appointment.findOne({
      doctor: doctor._id,
      status: "booked",
    }).sort({ token: 1 });

    if (!next) {
      return res.json({
        success: true,
        message: "No patients in queue",
      });
    }

    next.status = "completed";
    await next.save();

    doctor.currentPatients -= 1;
    await doctor.save();

    res.json({
      success: true,
      message: "Next patient completed",
      data: next,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};





export const toggleDoctorStatus = async (req, res) => {
  const doctor = await Doctor.findOne({ user: req.user._id });

  doctor.isOnline = !doctor.isOnline;
  await doctor.save();

  res.json({
    success: true,
    isOnline: doctor.isOnline,
  });
};