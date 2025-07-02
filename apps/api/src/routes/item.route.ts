import { Router } from "express";
import * as itemController from "../controllers/item.controller";

const router = Router();

router.post("/add", itemController.addItem);

export default router;
