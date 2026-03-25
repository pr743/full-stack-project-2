import express from "express";
import {
  getAllAppointments,
  getAllDoctors,
  getAllPatients,
  getDashboardStats,
  toggleUserStatus,
  deleteDoctor,
  deletePatient

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


export default router;






