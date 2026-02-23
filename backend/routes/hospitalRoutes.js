import express from "express";
import {
  addHospital,
  getHospitalByCity,
} from "../controllers/hospitalController.js";

import { getSavedHospital, saveHospital } from "../controllers/save-hospital.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();


router.get("/", getHospitalByCity);


router.post("/", protect, adminOnly, addHospital);


router.post("/save/:id", protect, saveHospital);
router.get("/saved", protect, getSavedHospital);

export default router;
