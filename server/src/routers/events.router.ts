import { Router } from "express";
import * as eventsController from "../controllers/events.controller.js";

const eventsRouter = Router();

eventsRouter.get("/", eventsController.getAllEvents);
eventsRouter.post("/", eventsController.addEvent);

eventsRouter.get("/clubs/:club_id", eventsController.getClubEvents);
eventsRouter.get("/user/:user_id/:page", eventsController.getPossibleUserEvents);
eventsRouter.get("/near/:user_id/:page", eventsController.getNearbyUserEvents);
eventsRouter.get("/query/:query/:page", eventsController.getQueryEvents);
eventsRouter.get("/querynear/:user_id/:query/:page", eventsController.getQueryNearbyEvents)
eventsRouter.put("/series/:series_id/:id", eventsController.updateEventSeries)
eventsRouter.delete("/series/:series_id/:id", eventsController.deleteEventSeries)

eventsRouter.get("/:id", eventsController.getEvent);
eventsRouter.put("/:id", eventsController.updateEvent);
eventsRouter.delete("/:id", eventsController.deleteEvent);

export default eventsRouter;