import { Router } from "express";
import * as serviceController from "../../controllers/service.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post(
  "/add",
  authorize("create", "Service"),
  serviceController.addService,
);
router.get("/", authorize("read", "Service"), serviceController.getServices);
router.put(
  "/:id",
  authorize("update", "Service", false),
  serviceController.updateService,
);
router.delete(
  "/:id",
  authorize("delete", "Service", false),
  serviceController.deleteService,
);

export default router;
