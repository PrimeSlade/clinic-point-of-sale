import { Router } from "express";
import * as patientController from "../../controllers/patient.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "Patient"), patientController.addPatient);
router.get("/", authorize("read", "Patient"), patientController.getPatients);
router.get("/:id", authorize("read", "Patient"), patientController.getPatientById);
router.put("/:id", authorize("update", "Patient"), patientController.updatePatient);
router.delete("/:id", authorize("delete", "Patient"), patientController.deletePatient);

export default router;
