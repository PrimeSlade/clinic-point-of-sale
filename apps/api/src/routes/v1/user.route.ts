import { Router } from "express";
import * as userController from "../../controllers/user.controller";
import authorize from "../../abilities/authorize.middleware";

const router = Router();

router.post("/add", authorize("create", "User"), userController.addUser);
router.get("/", authorize("read", "User"), userController.getUsers);
router.put("/:id", authorize("update", "User"), userController.updateUser);
router.delete("/:id", authorize("delete", "User"), userController.deleteUser);

export default router;
