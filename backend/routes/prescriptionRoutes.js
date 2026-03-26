
import express from "express";
import { doctorOnly, patientOnly, protect } from "../middleware/authMiddleware.js";
import { createPrescription, getDoctorPrescription, getDoctorTodayAppointments, getPatientHistory, getPatientPrescription } from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/", protect, doctorOnly, createPrescription);
router.get("/doctor", protect, doctorOnly, getDoctorPrescription);
router.get("/patient", protect, patientOnly, getPatientPrescription);
router.get("/history", protect, patientOnly, getPatientHistory);
router.get("/doctor/appointments", protect, doctorOnly, getDoctorTodayAppointments);

export default router;
