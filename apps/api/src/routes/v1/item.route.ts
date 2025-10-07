import { Router } from "express";
import * as itemController from "../../controllers/item.controller";
import authorize from "../../abilities/authorize.middleware";
import multer from "multer";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/add", authorize("create", "Item"), itemController.addItem);
router.get("/", authorize("read", "Item"), itemController.getItems);
router.post(
  "/import",
  authorize("create", "Item"),
  upload.single("file"),
  itemController.importItem,
);
router.post("/export", authorize("read", "Item"), itemController.exportItem);
router.get("/:id", authorize("read", "Item"), itemController.getItemById);
router.put("/:id", authorize("update", "Item"), itemController.updateItem);
router.delete("/:id", authorize("delete", "Item"), itemController.deleteItem);

export default router;
