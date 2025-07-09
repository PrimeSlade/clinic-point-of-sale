import { Router } from "express";
import itemRotues from "./item.route";
import locationRoutes from "./location.route";
import serviceRotues from "./service.route";

const router = Router();

router.use("/items", itemRotues);
router.use("/locations", locationRoutes);
router.use("/services", serviceRotues);

export default router;
