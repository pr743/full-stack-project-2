import express from "express";
import {
  getAllAppointments,
  getAllDoctors,
  getAllPatients,
  getDashboardStats,
  toggleUserStatus,

} from "../controllers/adminController.js";

import {protect,adminOnly}  from "../middleware/authMiddleware.js"
import { createDoctor } from "../controllers/doctorController.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getDashboardStats);
router.get("/doctors", protect, adminOnly, getAllDoctors);
router.get("/patients", protect, adminOnly, getAllPatients);
router.get("/appointments", protect, adminOnly, getAllAppointments);
router.get("/user/:id/status", protect, adminOnly, toggleUserStatus);
router.post("/doctors",protect,adminOnly, createDoctor);

export default router;




