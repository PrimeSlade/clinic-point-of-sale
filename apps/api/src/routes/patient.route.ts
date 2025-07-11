import { Router } from "express";
import * as patientController from "../controllers/patient.controller";

const router = Router();

router.post("/add", patientController.addPatient);
router.get("/", patientController.getPatients);
router.put("/:id", patientController.updatePatient);

export default router;
