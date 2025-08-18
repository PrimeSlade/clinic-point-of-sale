import { Router } from "express";
import * as categoryController from "../../controllers/category.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "Category"), categoryController.addCategory);
router.get("/", authorize("read", "Category"), categoryController.getCategories);
router.put("/:id", authorize("update", "Category"), categoryController.updateCategory);
router.delete("/:id", authorize("delete", "Category"), categoryController.deleteCategory);

export default router;
