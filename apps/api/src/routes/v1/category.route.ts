import { Router } from "express";
import * as categoryController from "../../controllers/category.controller";

const router = Router();

router.post("/add", categoryController.addCategory);
router.get("/", categoryController.getCategories);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
