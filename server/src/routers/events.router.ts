import { Router } from "express";
import * as eventsController from "../controllers/events.controller.js";

const eventsRouter = Router();

eventsRouter.get("/", eventsController.getAllEvents);
eventsRouter.post("/", eventsController.addEvent);

eventsRouter.get("/clubs/:club_id", eventsController.getClubEvents);
eventsRouter.get("/user/:user_id", eventsController.getPossibleUserEvents);

eventsRouter.get("/:id", eventsController.getEvent);
eventsRouter.put("/:id", eventsController.updateEvent);
eventsRouter.delete("/:id", eventsController.deleteEvent);

export default eventsRouter;