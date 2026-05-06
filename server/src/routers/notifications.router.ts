import { Router } from "express";
import * as notificationsController from "../controllers/notifications.controller.js";

const notificationsRouter = Router();

notificationsRouter.post("/", notificationsController.addNotification);

notificationsRouter.get("/:id", notificationsController.getNotification);
notificationsRouter.delete("/:id", notificationsController.deleteNotification);

notificationsRouter.get("/all/:user_id", notificationsController.getAllNotifications);
notificationsRouter.get("/num/:user_id", notificationsController.getNumNotifications);

export default notificationsRouter;