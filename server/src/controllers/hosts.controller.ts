import type { Request, Response } from "express";
import * as hostService from "../services/hosts.service.js";

export async function getAllHosts(req: Request, res: Response){
    try{
        const data = await hostService.getAllHosts();

        res.status(200).json({
            success: true,
            data: data
        })
    } catch(error){
        console.error("Error in getAllHosts: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getHost(req: Request, res: Response){
    try{
        const { event_id, user_id } = req.params;

        if(
            !event_id || typeof event_id !== "string" ||
            !user_id || typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "user id and event id required"
            });

        const data = await hostService.getHost(event_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("Error in getHost: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getEventHosts(req: Request, res: Response){
    try{
        const { event_id } = req.params;

        if(!event_id || typeof event_id !== "string")
            return res.status(400).json({
                success: false,
                error: "event id required"
            });

        const data = await hostService.getEventHosts(event_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("Error in getEventHosts: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getUserHosts(req: Request, res: Response){
    try{
        const { user_id } = req.params;

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "user id required"
            });

        const data = await hostService.getUserHosts(user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("Error in getUserHosts: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function addHost(req: Request, res: Response){
    try{
        const { event_id, user_id } = req.params;

        if(
            !event_id || typeof event_id !== "string" ||
            !user_id || typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "user id and event id required"
            });

        const data = await hostService.addHost(event_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("Error in addHosts: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function deleteHost(req: Request, res: Response){
    try{
        const { event_id, user_id } = req.params;

        if(
            !event_id || typeof event_id !== "string" ||
            !user_id || typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "user id and event id required"
            });

        const data = await hostService.deleteHost(event_id, user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("Error in deleteHosts: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}