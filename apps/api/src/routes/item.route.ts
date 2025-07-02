import { Router } from "express";
import * as itemController from "../controllers/item.controller";

const router = Router();

router.post("/add", itemController.addItem);
router.get("/get", itemController.getItems);
router.put("/edit/:id", itemController.updateItem);

export default router;
