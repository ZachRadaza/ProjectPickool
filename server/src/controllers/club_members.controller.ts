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
        console.log("getAllClubMembers error", error);
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
        console.log("getClubMembers error", error);
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
        console.log("getClubMembers error", error);
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
        console.log("getClubMembers error", error);
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
        console.log("getSingleClubMembers error", error);
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
        console.log("getClubMembersNum error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function addClubMember(req: Request, res: Response){
    try{
        const { club_id } = req.params;
        const { user_id } = req.body;

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
        console.log("addClubMember error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function updateClubMember(req: Request, res: Response){
    try{
        const { club_id } = req.params;
        const { user_id, updates} = req.body;

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
        console.log("updateClubMember error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function deleteClubMember(req: Request, res: Response){
    try{
        const { club_id } = req.params;
        const { user_id } = req.body;

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
        console.log("deleteClubMember error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}