import express from "express";
import {
  getPatientDashboard,
  getPatientProfile,
  createPatientProfile,
  getDoctorsForPatient,
  bookAppointment,
  getHospitalsForPatient,
  getDoctorsByHospital,
  getPatientAppointments,
  deleteAppointment

} from "../controllers/patientController.js";
import { patientOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getPatientDashboard);
router.get("/profile", protect, getPatientProfile);
router.post("/profile", protect, createPatientProfile);

router.get("/doctors", protect, getDoctorsForPatient);

router.get("/hospitals", protect, getHospitalsForPatient);
router.get("/hospitals/:hospitalId/doctors", protect, getDoctorsByHospital);

router.post("/appointment", protect, bookAppointment);


router.get("/appointments", protect, patientOnly, getPatientAppointments);
router.delete("/appointments/:id", protect, patientOnly, deleteAppointment);

export default router;
