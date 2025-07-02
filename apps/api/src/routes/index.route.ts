import { Router } from "express";
import itemRotues from "./item.route";

const router = Router();

router.use("/items", itemRotues);

export default router;
