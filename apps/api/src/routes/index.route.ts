import { Router } from "express";
import itemRoutes from "./item.route";
import locationRoutes from "./location.route";
import serviceRoutes from "./service.route";
import patientRoutes from "./patient.route";

const router = Router();

router.use("/items", itemRoutes);
router.use("/locations", locationRoutes);
router.use("/services", serviceRoutes);
router.use("/patients", patientRoutes);

export default router;
