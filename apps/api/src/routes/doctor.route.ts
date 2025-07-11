import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller";

const router = Router();

router.post("/add", doctorController.addDoctor);
router.get("/", doctorController.getDoctors);
router.put("/:id", doctorController.updateDoctor);

export default router;
