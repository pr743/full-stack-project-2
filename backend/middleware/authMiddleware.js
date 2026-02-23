import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";


const JWT_SECRET = process.env.JWT_SECRET;

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    
    const decoded = jwt.verify(token, JWT_SECRET);

    
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    
    if (user.role === "admin") {
      const hospital = await Hospital.findOne({ admin: user._id });

      if (!hospital) {
        return res.status(400).json({
          success: false,
          message: "Hospital not found for admin",
        });
      }

      req.hospitalId = hospital._id;
    }



    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: user._id, isActive: true });
      if (!doctor) {
        return res.status(400).json({ message: "Doctor profile not found" });
      }
      req.doctorId = doctor._id;
      req.hospitalId = doctor.hospital;
    }
    
    return   next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token invalid",
      error: error.message,
    });
  }
};


export const adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  else res.status(403).json({ success: false, message: "Admins only" });
};

export const doctorOnly = (req, res, next) => {
  if (req.user && req.user.role === "doctor") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Doctors only" });
};

export const patientOnly = (req, res, next) => {
  if (req.user?.role === "patient") return next();
  else res.status(403).json({ success: false, message: "Patients only" });
};
