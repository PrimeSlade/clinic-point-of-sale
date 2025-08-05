import { Router } from "express";
import * as patientController from "../../controllers/patient.controller";

const router = Router();

router.post("/add", patientController.addPatient);
router.get("/", patientController.getPatients);
router.get("/:id", patientController.getPatientById);
router.put("/:id", patientController.updatePatient);
router.delete("/:id", patientController.deletePatient);

export default router;
