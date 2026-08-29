import { Router } from "express";
import * as permissionController from "../../controllers/permission.controller";

const router = Router();

router.get("/", permissionController.getPermissions);

export default router;
