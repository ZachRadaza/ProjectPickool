import type { Notifications } from "../schemas";
import { supabase } from "../supabase";

const notifBody = `
    id,
    user_id,
    club:clubs(
        id,
        name,
        profile_pic
    ),
    event:events(
        id,
        name,
        start_time,
        club:clubs(id, name, profile_pic),
        price,
        approve_window
    ),
    notification_type,
    created_at
`;

export const NotificationService = {
    async getAllNotifications(user_id: string){
        try{
            const { data, error } = await supabase
                .from("notifications")
                .select(notifBody)
                .eq("user_id", user_id)
                .order("created_at", { ascending: false });

            if(error)
                throw new Error(error.message);

            return this.convertListOfNotifs(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getNumNotifications(user_id: string){
        try{
            const { count, error } = await supabase
                .from("notifications")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user_id);

            if(error)
                throw new Error(error.message);

            return count ?? 0;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getNotification(id: string){
        try{
            const { data, error } = await supabase
                .from("notifications")
                .select(notifBody)
                .eq("id", id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToNotif(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addNotification(notification: Notifications){
        try{
            const { data, error } = await supabase
                .from("notifications")
                .insert([notification])
                .select(notifBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToNotif(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteNotification(id: string){
        try{
            const { data, error } = await supabase
                .from("notifications")
                .delete()
                .eq("id", id)
                .select(notifBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToNotif(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    convertToNotif(data: any){
        if(data === null)
            return;

        const notif: Notifications = {
            id: data.id,
            user_id: data.user_id,
            club: data.club,
            event: data.event,
            notification_type: data.notification_type,
            created_at: data.created_at
        };

        return notif;
    },

    convertListOfNotifs(data: any[]){
        const notifs: any[] = data.map((noti) => this.convertToNotif(noti));
        const trimmed: Notifications[] = notifs.filter((noti) => noti !== null);

        return trimmed;
    }
};