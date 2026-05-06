import type { Request, Response } from "express";
import * as notificationService from "../services/notifications.service.js";


export async function getAllNotifications(req: Request, res: Response){
    try{
        const { user_id } = req.params;

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "user ID required"
            });

        const data = await notificationService.getAllNotifications(user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("getAllNotifications error: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getNumNotifications(req: Request, res: Response){
    try{
        const { user_id } = req.params;

        if(!user_id || typeof user_id !== "string")
            return res.status(400).json({
                success: false,
                error: "user ID required"
            });

        const data = await notificationService.getNumNotifications(user_id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("getNumNotifications error: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getNotification(req: Request, res: Response){
    try{
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: "ID required"
            });

        const data = await notificationService.getNotification(id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("getNotification error: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function addNotification(req: Request, res: Response){
    try{
        const { notification } = req.body;

        if(
            !notification ||
            !notification.user_id || typeof notification.user_id !== "string" ||
            !notification.notification_type || typeof notification.notification_type !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "proper notification content required"
            });

        const data = await notificationService.addNotification(notification);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("addNotification error: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function deleteNotification(req: Request, res: Response){
    try{
        const { id } = await req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: "id required"
            });

        const data = await notificationService.deleteNotification(id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("deleteNotification error: ", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}