import * as playersController from "../controllers/players.controller.js";
import { Router } from "express";

const playersRouter = Router();

playersRouter.get("/", playersController.getAllPlayers);
playersRouter.post("/", playersController.addPlayer);

playersRouter.get("/events/:event_id", playersController.getEventPlayers);
playersRouter.get("/user/:user_id", playersController.getUserPlayers);

playersRouter.get("/:event_id/:user_id", playersController.getPlayer);
playersRouter.put("/:event_id/:user_id", playersController.updatePlayer);
playersRouter.delete("/:event_id/:user_id", playersController.deletePlayer);

export default playersRouter;