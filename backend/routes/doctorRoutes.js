import express from "express";
import { protect, adminOnly, doctorOnly } from "../middleware/authMiddleware.js";
import {
  
  createDoctor,
  getDoctorDashboard,
  getDoctorAppointments,
  completeAppointment,
  getDoctorProfile,
  updateDoctorProfile,
} from "../controllers/doctorController.js";

const router = express.Router();


router.post("/", protect, adminOnly, createDoctor);


router.get("/dashboard", protect, doctorOnly, getDoctorDashboard);
router.get("/appointments", protect, doctorOnly, getDoctorAppointments);
router.patch(
  "/appointments/:id/complete",
  protect,
  doctorOnly,
  completeAppointment
);


router.get("/profile",protect,doctorOnly,getDoctorProfile);
router.put("/profile",protect,doctorOnly,updateDoctorProfile);

export default router;
