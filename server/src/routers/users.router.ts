import { Router } from "express";
import * as userController from "../controllers/users.controller.js";
import { upload } from "../lib/multer.js";

const usersRouter = Router();

usersRouter.get("/", userController.getAllUser);
usersRouter.post("/", userController.addUser);

usersRouter.get("/header/:id", userController.getUserHeader);
usersRouter.get("/clubs/:id", userController.getUserClubs)
usersRouter.get("/:id", userController.getUser);
usersRouter.put("/:id", upload.single("profile_pic_file"), userController.updateUser);
usersRouter.delete("/:id", userController.deleteUser);

export default usersRouter;