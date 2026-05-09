import type { Request, Response } from "express";
import * as eventService from "../services/events.service.js";
import { Recurring, type Events } from "../lib/schemas.js";
import * as locationService from "../services/location.service.js";
import * as eventSeriesService from "../services/event_series.service.js";
import { parsePage } from "./clubs.controller.js";

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
        const { user_id, page } = req.params;

        if(
            !user_id || typeof user_id !== "string" ||
            !page || typeof page !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "user id and page required"
            });

        const pageNum = parsePage(page);
        const eventsClub = await eventService.getPossibleUserClubEvents(user_id);
        const { data: eventsLoc, hasMore } = await eventService.getPossibleUserLocationEvents(user_id, pageNum);
        const events = [...eventsClub, ...eventsLoc];

        const uniqueEvents = Array.from(
            new Map(events.map(e => [e.id, e])).values()
        );

        res.status(200).json({
            success: true,
            data: uniqueEvents,
            hasMore: hasMore
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
        const { user_id, page } = req.params;

        if(
            !user_id || typeof user_id !== "string" ||
            !page || typeof page !== "string"

        )
            return res.status(400).json({
                success: false,
                error: "Event id required"
            });

        const pageNum = parsePage(page)
        const { data: events, hasMore } = await eventService.getPossibleUserLocationEvents(user_id, pageNum);

        res.status(200).json({
            success: true,
            data: events,
            hasMore: hasMore
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
        const { query, page } = req.params;

        if(
            !query || typeof query !== "string" ||
            !page || typeof page !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Event name required"
            });

        const pageNum = parsePage(page);
        const { data: events, hasMore } = await eventService.getQueryEvents(query, pageNum);

        res.status(200).json({
            success: true,
            data: events,
            hasMore
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
        const { user_id, query, page } = req.params;

        if(
            !query || typeof query !== "string" ||
            !user_id || typeof user_id !== "string" ||
            !page || typeof page !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Event name and user id required"
            });

        const pageNum = parsePage(page);
        const { data: events, hasMore } = await eventService.getQueryNearbyEvents(user_id, query, pageNum);

        res.status(200).json({
            success: true,
            data: events,
            hasMore: hasMore
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

        if(!event || !validateEventBody(event))
            return res.status(400).json({
                success: false,
                error: "event body must have valid values"
            });

        let eventUpdatedLoc = { ...eventNoLoc };

        if(location && !location.id){
            const locationNew = await locationService.locationExists(location);
            eventUpdatedLoc = { ...eventNoLoc,  location_id: locationNew.id };
        }

        let addedEvent = null;
        if(eventUpdatedLoc.recurring !== Recurring.NONE)
            addedEvent = await eventSeriesService.addEventSeries(eventUpdatedLoc);
        else
            addedEvent = await eventService.addEvent(eventUpdatedLoc);

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

export async function updateEventSeries(req: Request, res: Response){
    try{
        const { id, series_id } = req.params;
        const { event } = req.body;

        const { location, ...eventNoLoc } = event;

        if(
            !id || typeof id !== "string" ||
            !series_id || typeof series_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Event id and series id required"
            });

        let eventUpdatedLoc = { ...eventNoLoc };

        if(location && !location.id){
            const locationNew = await locationService.locationExists(location);
            eventUpdatedLoc = { ...eventNoLoc,  location_id: locationNew.id };
        }

        const updatedEventSeries = await eventSeriesService.updateEventSeries(series_id, eventUpdatedLoc);

        res.status(200).json({
            success: true,
            data: updatedEventSeries
        });
    } catch(error: any){
        console.error("updateEventEvents Error: ", error.message);
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

export async function deleteEventSeries(req: Request, res: Response){
    try{
        const { id, series_id } = req.params;

        if(
            !id || typeof id !== "string" ||
            !series_id || typeof series_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "Event id and series id required"
            });

        const deleteEvent = await eventService.deleteEvent(id);
        await eventSeriesService.deleteEventSeries(series_id);

        res.status(200).json({
            success: true,
            data: deleteEvent
        });
    } catch(error: any){
        console.error("deleteEventSeries Error: ", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server error"
        });
    }
}

function validateEventBody(event: Events){
    return (event.club_id && event.start_time && event.end_time && event.name && event.price !== null);
}