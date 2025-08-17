import { Router } from "express";
import * as roleController from "../../controllers/role.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "Role"), roleController.addRole);
router.get("/", authorize("read", "Role"), roleController.getRoles);
router.put("/:id", authorize("update", "Role"), roleController.updateRole);
router.delete("/:id", authorize("delete", "Role"), roleController.deleteRole);

export default router;
