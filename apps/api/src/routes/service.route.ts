import { Router } from "express";
import * as serviceController from "../controllers/service.controller";

const router = Router();

router.post("/add", serviceController.addService);
router.get("/", serviceController.getServices);
router.put("/:id", serviceController.updateService);
router.delete("/:id", serviceController.deleteService);

export default router;
