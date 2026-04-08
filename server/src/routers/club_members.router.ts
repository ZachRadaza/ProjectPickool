import { Router } from "express";
import * as clubMemberController from "../controllers/club_members.controller.js";

const clubMemberRouter = Router();

clubMemberRouter.get("/", clubMemberController.getAllClubMembers);

clubMemberRouter.get("/single/:club_id/:user_id", clubMemberController.getSingleClubMember);
clubMemberRouter.get("/basic/:club_id/:user_id", clubMemberController.getSingleClubMember);
clubMemberRouter.get("/num/:club_id", clubMemberController.getClubMembersNum);

clubMemberRouter.get("/admins/:club_id", clubMemberController.getClubAdmins);
clubMemberRouter.get("/owner/:club_id", clubMemberController.getClubOwner);

clubMemberRouter.get("/:club_id", clubMemberController.getClubMembers);
clubMemberRouter.post("/:club_id", clubMemberController.addClubMember);
clubMemberRouter.put("/:club_id", clubMemberController.updateClubMember);
clubMemberRouter.delete("/:club_id", clubMemberController.deleteClubMember);

export default clubMemberRouter;