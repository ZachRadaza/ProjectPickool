import { Router } from "express";
import * as clubRequestController from "../controllers/club_requests.controller.js"

const clubRequestsRouter = Router();

clubRequestsRouter.get("/", clubRequestController.getAllRequests);
clubRequestsRouter.post("/", clubRequestController.addClubRequests);

clubRequestsRouter.get("/num/:club_id", clubRequestController.getNumClubRequests)

clubRequestsRouter.delete("/approve/:user_id/:club_id", clubRequestController.approveClubRequests);
clubRequestsRouter.delete("/deny/:user_id/:club_id", clubRequestController.denyClubRequests);

clubRequestsRouter.get("/users/:user_id", clubRequestController.getUserRequests);
clubRequestsRouter.get("/users/:user_id/:club_id", clubRequestController.getUserClubRequest)

clubRequestsRouter.get("/:club_id", clubRequestController.getClubRequests);

export default clubRequestsRouter;