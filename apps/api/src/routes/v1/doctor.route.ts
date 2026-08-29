import { Router } from "express";
import * as doctorController from "../../controllers/doctor.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "Doctor"), doctorController.addDoctor);
router.get("/", authorize("read", "Doctor"), doctorController.getDoctors);
router.put("/:id", authorize("update", "Doctor"), doctorController.updateDoctor);
router.delete("/:id", authorize("delete", "Doctor"), doctorController.deleteDoctor);

export default router;
