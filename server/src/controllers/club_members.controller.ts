import type { Request, Response } from "express";
import * as clubMemberService from "../services/club_members.service.js";

export async function getAllClubMembers(req: Request, res: Response){
    try{
        const data = await clubMemberService.getAllClubMembers();

        res.status(200).json({
            success: false,
            data: data
        });
    } catch(error: any){
        console.error("getAllClubMembers error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getClubMembers(req: Request, res: Response){
    try{
        const { club_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "club id required"
            });

        const data = await clubMemberService.getClubMembers(club_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getClubMembers error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getClubAdmins(req: Request, res: Response){
    try{
        const { club_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "club id required"
            });

        const data = await clubMemberService.getClubAdmins(club_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getClubMembers error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getClubOwner(req: Request, res: Response){
    try{
        const { club_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "club id required"
            });

        const data = await clubMemberService.getClubOwner(club_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getClubMembers error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getClubUnapproved(req: Request, res: Response){
    try{
        const { club_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "club id required"
            });

        const data = await clubMemberService.getClubUnapproved(club_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getClubUnapproved error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getSingleClubMember(req: Request, res: Response){
    try{
        const { club_id, user_id } = req.params;

        if(!club_id || 
            typeof club_id !== "string" ||
            !user_id || 
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "club id and user id required"
            });

        const data = await clubMemberService.getSingleClubMember(club_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getSingleClubMembers error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getBasicClubMember(req: Request, res: Response){
    try{
        const { club_id, user_id } = req.params;

        if(!club_id || 
            typeof club_id !== "string" ||
            !user_id || 
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "club id and user id required"
            });

        const data = await clubMemberService.getSingleClubMember(club_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getSingleClubMembers error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getClubMembersNum(req: Request, res: Response){
    try{
        const { club_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "club id required"        
            });

        const data = await clubMemberService.getClubMembersNum(club_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getClubMembersNum error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getQueryClubMembers(req: Request, res: Response){
    try{
        const { club_id, query } = req.params;

        if(
            !club_id || typeof club_id !== "string" ||
            !query|| typeof query !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "club id and query required"        
            });

        const data = await clubMemberService.getQueryClubMembers(club_id, query);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getQueryClubMembers error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function addClubMember(req: Request, res: Response){
    try{
        const { user_id, club_id } = req.body;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "club id required"
            });

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "user_id required"
            });

        const data = await clubMemberService.addClubMember(club_id, user_id, false);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("addClubMember error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function updateClubMember(req: Request, res: Response){
    try{
        const { club_id, user_id } = req.params;
        const { updates } = req.body;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "club id required"
            });

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "user_id required"
            });

        const data = await clubMemberService.updateClubMember(club_id, user_id, updates);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("updateClubMember error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function deleteClubMember(req: Request, res: Response){
    try{
        const { club_id, user_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "club id required"
            });

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "user_id required"
            });

        const data = await clubMemberService.deleteClubMember(club_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("deleteClubMember error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}