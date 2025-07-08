import { Router } from "express";
import * as itemController from "../controllers/item.controller";

const router = Router();

router.post("/add", itemController.addItem);
router.get("/", itemController.getItems);
router.put("/:id", itemController.updateItem);
router.delete("/:id", itemController.deleteItem);

export default router;
