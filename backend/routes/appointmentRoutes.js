import express from "express";
import {
  protect,
  adminOnly,
  patientOnly,
  doctorOnly,
} from "../middleware/authMiddleware.js";

import {
  bookAppointment,
  getDoctorAppointment,
  getAllAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getPatientHistory,
  deleteAppointment,
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", protect, patientOnly, bookAppointment);

router.get("/doctor", protect, doctorOnly, getDoctorAppointment);

router.patch(
  "/doctor/:id/status",
  protect,
  doctorOnly,
  updateAppointmentStatus,
);

router.get("/admin", protect, adminOnly, getAllAppointment);

router.patch("/:id/cancel", protect, adminOnly, cancelAppointment);
router.patch("/admin/:id/status", protect, adminOnly, updateAppointmentStatus);
router.get(
  "/patient/:patientId/history",
  protect,
  doctorOnly,
  getPatientHistory
);

router.delete("/admin/:id", protect, adminOnly, deleteAppointment);


export default router;
