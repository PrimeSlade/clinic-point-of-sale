import { Router } from "express";
import * as locationController from "../../controllers/location.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post(
  "/add",
  authorize("create", "Location"),
  locationController.addLocaiton,
);
router.get("/", authorize("read", "Location"), locationController.getLocations);
router.put(
  "/:id",
  authorize("update", "Location"),
  locationController.updateLocation,
);
router.delete(
  "/:id",
  authorize("delete", "Location"),
  locationController.deleteLocation,
);

export default router;
