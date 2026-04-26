import type { Request, Response } from "express";
import * as playerService from "../services/players.service.js";

export async function getAllPlayers(req: Request, res: Response){
    try{
        const data = await playerService.getAllPlayers();

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getAllPlayers Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}

export async function getPlayer(req: Request, res: Response){
    try{
        const { event_id, user_id } = req.params;

        if(
            !event_id || 
            typeof event_id !== "string" ||
            !user_id ||
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "event id and user id required"
            });

        const player = await playerService.getPlayer(event_id, user_id);

        res.status(200).json({
            success: true,
            data: player
        });
    } catch(error: any){
        console.error("getPlayer Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}

export async function getEventPlayers(req: Request, res: Response){
    try{
        const { event_id } = req.params;

        if(!event_id || typeof event_id !== "string")
            return res.status(400).json({
                success: false,
                error: "event id required"
            });

        const data = await playerService.getEventPlayers(event_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getEventPlayers Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}

export async function getUserPlayers(req: Request, res: Response){
    try{
        const { user_id } = req.params;

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "user id required"
            });

        const data = await playerService.getUserPlayers(user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("getUserPlayers Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}

export async function addPlayer(req: Request, res: Response){
    try{
        const { event_id, user_id, approved, paid } = req.body;

        if(
            !event_id || 
            typeof event_id !== "string" ||
            !user_id ||
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "event id and user id required"
            });

        const data = await playerService.addPlayer(event_id, user_id, approved, paid);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("addPlayers Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}

export async function updatePlayer(req: Request, res: Response){
    try{
        const { event_id, user_id } = req.params;
        const { updates } = req.body;
        if(
            !event_id || 
            typeof event_id !== "string" ||
            !user_id ||
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "event id and user id required"
            });

        const data = await playerService.updatePlayer(event_id, user_id, updates);

        res.status(200).json({
            success: true,
            data: data
        });      
    } catch(error: any){
        console.error("updatePlayers Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}

export async function deletePlayer(req: Request, res: Response){
    try{
        const { event_id, user_id } = req.params;

        if(
            !event_id || 
            typeof event_id !== "string" ||
            !user_id ||
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "event id and user id required"
            });

        const data = await playerService.deletePlayer(event_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("deletePlayers Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error"
        });
    }
}