import { Router } from "express";
import itemRotues from "./item.route";
import locationRoutes from "./location.route";

const router = Router();

router.use("/items", itemRotues);
router.use("/locations", locationRoutes);

export default router;
