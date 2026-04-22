import type { Request, Response } from "express";
import * as eventService from "../services/events.service.js";
import type { Events } from "../lib/schemas.js";
import * as locationService from "../services/location.service.js";

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

        const eventsClub = await eventService.getPossibleUserClubEvents(user_id);
        const eventsLoc = await eventService.getPossibleUserLocationEvents(user_id);
        const events = [...eventsClub, ...eventsLoc];

        const uniqueEvents = Array.from(
            new Map(events.map(e => [e.id, e])).values()
        );

        res.status(200).json({
            success: true,
            data: uniqueEvents
        });
    } catch(error: any){
        console.error("getAllPossibleEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function getNearbyUserEvents(req: Request, res: Response){
    try{
        const { user_id } = req.params;

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "Event id required"
            });

        const events = await eventService.getPossibleUserLocationEvents(user_id);

        res.status(200).json({
            success: true,
            data: events
        });
    } catch(error: any){
        console.error("getNearUserEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function getQueryEvents(req: Request, res: Response){
    try{
        const { query } = req.params;

        if(!query || typeof query !== "string")
            return res.status(400).json({
                success: false,
                error: "Event name required"
            });

        const events = await eventService.getQueryEvents(query);

        res.status(200).json({
            success: true,
            data: events
        });
    } catch(error: any){
        console.error("getNearUserEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function getQueryNearbyEvents(req: Request, res: Response){
    try{
        const { user_id, query } = req.params;

        if(!query || 
            typeof query !== "string" ||
            !user_id || 
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Event name and user id required"
            });

        const events = await eventService.getQueryNearbyEvents(user_id, query);

        res.status(200).json({
            success: true,
            data: events
        });
    } catch(error: any){
        console.error("getNearUserEvents Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

export async function addEvent(req: Request, res: Response){
    try{
        const { event } = req.body;
        const { location, ...eventNoLoc } = event;

        if(!event || validateEventBody(event))
            return res.status(400).json({
                success: false,
                error: "event body must have valid values"
            });

        let eventUpdatedLoc = { ...eventNoLoc };

        if(location && !location.id){
            const locationNew = await locationService.locationExists(location);
            eventUpdatedLoc = { ...eventNoLoc,  location_id: locationNew.id };
        }

        const addedEvent = await eventService.addEvent(eventUpdatedLoc);

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

        const { location, ...eventNoLoc } = event;

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

        let eventUpdatedLoc = { ...eventNoLoc };

        if(location && !location.id){
            const locationNew = await locationService.locationExists(location);
            eventUpdatedLoc = { ...eventNoLoc,  location_id: locationNew.id };
        }

        const updatedEvent = await eventService.updateEvent(id, eventUpdatedLoc);

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