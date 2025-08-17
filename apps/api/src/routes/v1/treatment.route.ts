import { Router } from "express";
import * as treatmentController from "../../controllers/treatment.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "Treatment"), treatmentController.addTreatment);
router.get("/", authorize("read", "Treatment"), treatmentController.getTreatments);
router.get("/:id", authorize("read", "Treatment"), treatmentController.getTreatmentById);
router.put("/:id", authorize("update", "Treatment"), treatmentController.updateTreatment);
router.delete("/:id", authorize("delete", "Treatment"), treatmentController.deleteTreatment);

export default router;
