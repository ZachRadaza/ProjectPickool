import type { Notifications } from "../lib/schemas.js";
import { supabase } from "../lib/supabase.js";

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

export async function getAllNotifications(user_id: string){
    const { data, error } = await supabase
        .from("notifications")
        .select(notifBody)
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getNumNotifications(user_id: string){
    const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user_id);

    if(error)
        throw new Error(error.message);

    return count ?? 0;
}

export async function getNotification(id: string){
    const { data, error } = await supabase
        .from("notifications")
        .select(notifBody)
        .eq("id", id)
        .maybeSingle();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function addNotification(notifications: Notifications){
    const { data, error } = await supabase
        .from("notifications")
        .insert([notifications])
        .select(notifBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function deleteNotification(id: string){
    const { data, error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id)
        .select(notifBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}