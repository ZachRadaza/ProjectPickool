import type { Request, Response } from "express";
import * as clubRequestsService from "../services/club_requests.service.js";
import * as clubMemberService from "../services/club_members.service.js";
import { RequestStatus } from "../lib/schemas.js";

export async function getAllRequests(req: Request, res: Response){
    try{
        const data = await clubRequestsService.getAllRequests();

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getAllRequests Error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getClubRequests(req: Request, res: Response){
    try{
        const { club_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "Club id required"
            });

        const requests = await clubRequestsService.getClubRequests(club_id);

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch(error: any){
        console.error("getClubRequests Error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getNumClubRequests(req: Request, res: Response){
    try{
        const { club_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "Club id required"
            });

        const requests = await clubRequestsService.getNumClubRequests(club_id);

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch(error: any){
        console.error("getClubRequests Error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getUserRequests(req: Request, res: Response){
    try{
        const { user_id } = req.params;

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "Club id required"
            });

        const data = await clubRequestsService.getUserRequests(user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getClubRequests Error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getUserClubRequest(req: Request, res: Response){
    try{
        const { user_id, club_id } = req.params;

        if(!user_id || 
            typeof user_id !== "string" ||
            !club_id ||
            typeof club_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Club id and User Id required"
            });

        const data = await clubRequestsService.getUserClubRequest(user_id, club_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getClubRequests Error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function addClubRequests(req: Request, res: Response){
    try{
        const { user_id, club_id } = req.body;

        if(!club_id || 
            typeof club_id !== "string" ||
            !user_id || 
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Club id required"
            });


        const data = await clubRequestsService.addClubRequests(club_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("addClubRequests Error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function approveClubRequests(req: Request, res: Response){
    try{
        const { user_id, club_id } = req.params;

        if(!club_id || 
            typeof club_id !== "string" ||
            !user_id || 
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Club id required"
            });

        const approvedUser = await clubRequestsService.deleteClubRequests(club_id, user_id);
        const data = await clubMemberService.addClubMember(approvedUser.club_id, approvedUser.user_id, false);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("approveClubRequests Error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function denyClubRequests(req: Request, res: Response){
    try{
        const { user_id, club_id } = req.params;

        if(!club_id || 
            typeof club_id !== "string" ||
            !user_id || 
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Club id required"
            });

        const data = await clubRequestsService.deleteClubRequests(club_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("approveClubRequests Error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}