
import express from "express";
import { doctorOnly, patientOnly, protect } from "../middleware/authMiddleware.js";
import { createPrescription, getDoctorPrescription, getDoctorTodayAppointments, getPatientHistory, getPatientPrescription, getDoctorAppointmentsForPrescription, downloadPrescriptionPDF, deletePrescription } from "../controllers/prescriptionController.js";

const router = express.Router();

router.post("/", protect, doctorOnly, createPrescription);
router.get("/doctor", protect, doctorOnly, getDoctorPrescription);
router.get("/patient", protect, patientOnly, getPatientPrescription);
router.get("/history", protect, patientOnly, getPatientHistory);
router.get("/doctor/appointments", protect, doctorOnly, getDoctorTodayAppointments);
router.get(
    "/doctor/appointments",
    protect,
    doctorOnly,
    getDoctorAppointmentsForPrescription
);


router.get("/:id/pdf", protect, downloadPrescriptionPDF);

router.delete(
    "/doctor/appointments",
    protect,
    patientOnly,
    deletePrescription
);

export default router;
