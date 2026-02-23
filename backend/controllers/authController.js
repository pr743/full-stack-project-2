import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Hospital from "../models/Hospital.js";
import Doctor from "../models/Doctor.js";

const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });
};


export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password , city } = req.body;

    if (!name || !email || !password || !city) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    const hospital = await Hospital.create({
      name: `${name} Hospital`,
      admin: admin._id,
      city,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        id: admin._id,
        role: admin.role,
        hospitalId: hospital._id,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "patient", 
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: "Account disabled" });
    }

    let hospitalId = null;

    
   if (user.role === "admin") {
  let hospital = await Hospital.findOne({ admin: user._id });

  if (!hospital) {

    if (!req.body.city) {
      return res.status(400).json({
        success: false,
        message: "City is required for first-time admin login",
      });
    }

    hospital = await Hospital.create({
      name: `${user.name} Hospital`,
      admin: user._id,
      city: hospitalFromRegister.city,
    });
  }

  hospitalId = hospital._id;
}
   


    
    if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ user: user._id }).populate("hospital");

      if (!doctor) {
        return res.status(404).json({
          success: false,
          message: "Doctor profile not found. Contact admin.",
        });
      }

      hospitalId = doctor.hospital?._id || null;
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        hospitalId,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error); 
    res.status(500).json({ success: false, message: error.message });
  }
};
