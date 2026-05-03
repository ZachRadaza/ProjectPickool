import { Router } from "express";
import * as hostController from "../controllers/hosts.controller.js";

const hostRouter = Router();

hostRouter.get("/", hostController.getAllHosts);

hostRouter.get("/event/:event_id", hostController.getEventHosts);
hostRouter.get("/user/:user_id", hostController.getUserHosts);

hostRouter.post("/series/:event_series_id/:user_id", hostController.addHostSeries);
hostRouter.delete("/series/:event_series_id/:user_id", hostController.deleteHostSeries);

hostRouter.get("/:event_id/:user_id", hostController.getHost);
hostRouter.post("/:event_id/:user_id", hostController.addHost);
hostRouter.delete("/:event_id/:user_id", hostController.deleteHost);

export default hostRouter;