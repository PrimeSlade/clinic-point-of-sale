import { Router } from "express";
import * as locationController from "../controllers/location.controller";

const router = Router();

router.post("/add", locationController.addLocaiton);
router.get("/", locationController.getAllLocations);
router.put("/:id", locationController.updateLocation);
router.delete("/:id", locationController.deleteLocation);

export default router;
