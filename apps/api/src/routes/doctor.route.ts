import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller";

const router = Router();

router.post("/add", doctorController.addDoctor);
router.get("/", doctorController.getDoctors);
router.put("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.deleteDoctor);

export default router;
