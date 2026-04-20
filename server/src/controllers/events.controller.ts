import type { Request, Response } from "express";
import * as eventService from "../services/events.service.js";
import type { Events } from "../lib/schemas.js";

export async function getAllEvents(req: Request, res: Response){
    try{
        const events = await eventService.getAllEvents();

        res.status(200).json({
            success: true,
            data: events
        });
    } catch(error: any){
        console.error("getAllEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function getEvent(req: Request, res: Response){
    try{
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: "Event id required"
            });

        const event = await eventService.getEvent(id);

        res.status(200).json({
            success: true,
            data: event
        });
    } catch(error: any){
        console.error("getEvent Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function getClubEvents(req: Request, res: Response){
    try{
        const { club_id } = req.params;

        if(!club_id || typeof club_id !== "string")
            return res.status(400).json({
                success: false,
                error: "Club id required"
            });

        const events = await eventService.getClubEvents(club_id);

        res.status(200).json({
            success: true,
            data: events
        });
    } catch(error: any){
        console.error("getClubEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function getPossibleUserEvents(req: Request, res: Response){
    try{
        const { user_id } = req.params;

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "Event id required"
            });

        const events = await eventService.getPossibleUserEvents(user_id);

        res.status(200).json({
            success: true,
            data: events
        });
    } catch(error: any){
        console.error("getAllPossibleEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function addEvent(req: Request, res: Response){
    try{
        const { event } = req.body;

        if(!event || validateEventBody(event))
            return res.status(400).json({
                success: false,
                error: "event body must have valid values"
            });

        const addedEvent = await eventService.addEvent(event);

        res.status(200).json({
            success: true,
            data: addedEvent
        });
    } catch(error: any){
        console.error("addEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function updateEvent(req: Request, res: Response){
    try{
        const { id } = req.params;
        const { event } = req.body;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: "Event id required"
            });

        if(!event)
            return res.status(400).json({
                success: false,
                error: "event body must have valid values"
            });

        const updatedEvent = await eventService.updateEvent(id, event);

        res.status(200).json({
            success: true,
            data: updatedEvent
        });
    } catch(error: any){
        console.error("updateEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function deleteEvent(req: Request, res: Response){
    try{
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: "Event id required"
            });

        const deletedEvent = await eventService.deleteEvent(id);

        res.status(200).json({
            success: true,
            data: deletedEvent
        });
    } catch(error: any){
        console.error("deleteEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

function validateEventBody(event: Events){
    return (event.club_id && event.start_time && event.end_time && event.name && event.price);
}