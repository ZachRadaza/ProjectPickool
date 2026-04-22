import { Router } from "express";
import * as clubsController from "../controllers/clubs.controller.js";
import { upload } from "../lib/multer.js";

const clubsRouter = Router();

clubsRouter.get("/", clubsController.getAllClubs);
clubsRouter.post("/", 
    upload.fields([
        { name: "profile_pic_file", maxCount: 1 },
        { name: "banner_file", maxCount: 1 }
    ]), 
    clubsController.addClub);

clubsRouter.get("/near/:user_id", clubsController.getNearbyClubs);
clubsRouter.get("/query/:query", clubsController.getQueryClubs);
clubsRouter.get("/querynear/:user_id/:query", clubsController.getQueryNearbyClubs);

clubsRouter.get("/:id", clubsController.getClub);
clubsRouter.put("/:id", 
    upload.fields([
        { name: "profile_pic_file", maxCount: 1 },
        { name: "banner_file", maxCount: 1 }
    ]),
    clubsController.updateClub
);
clubsRouter.delete("/:id", clubsController.deleteClub);

export default clubsRouter;