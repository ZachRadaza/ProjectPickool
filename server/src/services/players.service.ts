import type { Players } from "../lib/schemas.js";
import { supabase, supabaseAdmin } from "../lib/supabase.js";

const playerBody = `
    event_id,
    user:users(
        id,
        username,
        profile_pic
    ),
    approved,
    paid,
    approved_at,
    created_at
`;

export async function getAllPlayers(){
    const { data ,error } = await supabaseAdmin
        .from("players")
        .select(playerBody);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getPlayer(event_id: string, user_id: string){
    const { data, error } = await supabase
        .from("players")
        .select(playerBody)
        .eq("event_id", event_id)
        .eq("user_id", user_id)
        .maybeSingle();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getEventPlayers(event_id: string){
    const { data, error } = await supabase
        .from("players")
        .select(playerBody)
        .eq("event_id", event_id)

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getUserPlayers(user_id: string){
    const { data, error } = await supabase
        .from("players")
        .select("event_id, approved")
        .eq("user_id", user_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function addPlayer(event_id: string, user_id: string, approved: boolean, paid: boolean){
    const { data, error } = await supabase
        .from("players")
        .insert([{ event_id, user_id, approved, paid }])
        .select(playerBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function updatePlayer(event_id: string, user_id: string, update: Partial<Players>){
    const { data, error } = await supabase
        .from("players")
        .update(update)
        .select(playerBody)
        .eq("user_id", user_id)
        .eq("event_id", event_id)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function deletePlayer(event_id: string, user_id: string){
    const { data, error } = await supabase
        .from("players")
        .delete()
        .select(playerBody)
        .eq("user_id", user_id)
        .eq("event_id", event_id)
        .maybeSingle();

    if(error)
        throw new Error(error.message);

    return data;
}