import { Router } from "express";
import * as itemController from "../../controllers/item.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "Item"), itemController.addItem);
router.get("/", itemController.getItems); //authorize("read", "Item"),
router.get("/:id", authorize("read", "Item"), itemController.getItemById);
router.put("/:id", authorize("update", "Item"), itemController.updateItem);
router.delete("/:id", authorize("delete", "Item"), itemController.deleteItem);

export default router;
