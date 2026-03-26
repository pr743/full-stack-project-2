import express from "express";
import { suggestMedicinesAI } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/suggest", protect, suggestMedicinesAI);

export default router;