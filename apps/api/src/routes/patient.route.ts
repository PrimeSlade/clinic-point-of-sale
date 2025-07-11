import { Router } from "express";
import * as patientController from "../controllers/patient.controller";

const router = Router();

router.post("/add", patientController.addPatient);

export default router;
