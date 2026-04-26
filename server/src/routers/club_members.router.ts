import { Router } from "express";
import * as clubMemberController from "../controllers/club_members.controller.js";

const clubMemberRouter = Router();

clubMemberRouter.get("/", clubMemberController.getAllClubMembers);
clubMemberRouter.post("/", clubMemberController.addClubMember);

clubMemberRouter.get("/single/:club_id/:user_id", clubMemberController.getSingleClubMember);
clubMemberRouter.get("/basic/:club_id/:user_id", clubMemberController.getSingleClubMember);
clubMemberRouter.get("/num/:club_id", clubMemberController.getClubMembersNum);

clubMemberRouter.get("/admins/:club_id", clubMemberController.getClubAdmins);
clubMemberRouter.get("/owner/:club_id", clubMemberController.getClubOwner);
clubMemberRouter.get("/unapproved/:club_id", clubMemberController.getClubUnapproved);
clubMemberRouter.get("/query/:club_id/:query", clubMemberController.getQueryClubMembers);

clubMemberRouter.get("/:club_id", clubMemberController.getClubMembers);
clubMemberRouter.put("/:club_id/:user_id", clubMemberController.updateClubMember);
clubMemberRouter.delete("/:club_id/:user_id", clubMemberController.deleteClubMember);

export default clubMemberRouter;