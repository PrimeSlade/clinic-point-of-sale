import { Router } from "express";
import * as treatmentController from "../controllers/treatment.controller";

const router = Router();

router.post("/add", treatmentController.addTreatment);
router.get("/", treatmentController.getTreatments);
router.put("/:id", treatmentController.updateTreatment);
router.delete("/:id", treatmentController.deleteTreatment);

export default router;
