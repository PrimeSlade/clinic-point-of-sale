import { Router } from "express";
import * as roleController from "../../controllers/role.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "Role"), roleController.addRole);
router.get("/", authorize("read", "Role"), roleController.getRoles);
router.get("/:id", authorize("read", "Role"), roleController.getRoleById);
router.put(
  "/:id",
  authorize("update", "Role", false),
  roleController.updateRole,
);
router.delete(
  "/:id",
  authorize("delete", "Role", false),
  roleController.deleteRole,
);
router.patch(
  "/:id",
  authorize("update", "Role", false),
  roleController.assignRole,
);

export default router;
