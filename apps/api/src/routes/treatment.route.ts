import { Router } from "express";
import * as treatmentController from "../controllers/treatment.controller";

const router = Router();

router.post("/add", treatmentController.addTreatment);

export default router;
