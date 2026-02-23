import express from "express";
import {
  getPatientDashboard,
  getPatientProfile,
  createPatientProfile,
  getDoctorsForPatient,
  bookAppointment,
  getHospitalsForPatient,
  getDoctorsByHospital,
} from "../controllers/patientController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getPatientDashboard);
router.get("/profile", protect, getPatientProfile);
router.post("/profile", protect, createPatientProfile);

router.get("/doctors", protect, getDoctorsForPatient);

router.get("/hospitals", protect, getHospitalsForPatient);
router.get("/hospitals/:hospitalId/doctors", protect, getDoctorsByHospital);

router.post("/appointment", protect, bookAppointment);

export default router;
