import { Router } from "express";
import * as clubRequestController from "../controllers/club_requests.controller.js"

const clubRequestsRouter = Router();

clubRequestsRouter.get("/", clubRequestController.getAllRequests);

clubRequestsRouter.put("/approve/:id", clubRequestController.approveClubRequests);
clubRequestsRouter.put("/deny/:id", clubRequestController.denyClubRequests);

clubRequestsRouter.get("users/:user_id", clubRequestController.getClubRequests);

clubRequestsRouter.get("/:club_id", clubRequestController.getClubRequests);
clubRequestsRouter.post("/:club_id", clubRequestController.addClubRequests);
clubRequestsRouter.delete("/:id", clubRequestController.deleteClubRequests);

export default clubRequestsRouter;