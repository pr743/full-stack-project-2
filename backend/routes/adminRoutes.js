import express from "express";
import {
  getAllAppointments,
  getAllDoctors,
  getAllPatients,
  getDashboardStats,
  toggleUserStatus,
  deleteDoctor,
  deletePatient,
  updateDoctor,
  getClinicInsights,
  aiHospitalSetup,
  aiDoctorSetup

} from "../controllers/adminController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/doctors", protect, adminOnly, getAllDoctors);
router.get("/patients", protect, adminOnly, getAllPatients);
router.get("/appointments", protect, adminOnly, getAllAppointments);
router.patch("/users/:userId/toggle", protect, adminOnly, toggleUserStatus);
router.delete("/users/:userId", protect, adminOnly, deleteDoctor);
router.delete("/patients/:userId", protect, adminOnly, deletePatient);
router.put("/doctors/:doctorId", protect, adminOnly, updateDoctor);
router.get("/ai-insights", protect, adminOnly, getClinicInsights);

router.post("/ai-hospital-setup", protect, adminOnly, aiHospitalSetup);

router.post("/ai-doctor-setup", protect, adminOnly, aiDoctorSetup);

export default router;






