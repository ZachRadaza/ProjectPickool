import { supabase, supabaseAdmin } from "../lib/supabase.js";

const hostBody = `
    event_id,
    user:users(
        id,
        username,
        profile_pic
    ),
    created_at
`;

export async function getAllHosts(){
    const { data, error } = await supabaseAdmin
        .from("hosts")
        .select(hostBody)

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getHost(event_id: string, user_id: string){
    const { data, error } = await supabase
        .from("hosts")
        .select(hostBody)
        .eq("event_id", event_id)
        .eq("user_id", user_id)
        .maybeSingle();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getEventHosts(event_id: string){
    const { data, error } = await supabase
        .from("hosts")
        .select(hostBody)
        .eq("event_id", event_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getUserHosts(user_id: string){
    const { data, error } = await supabase
        .from("hosts")
        .select(hostBody)
        .eq("user_id", user_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function addHost(event_id: string, user_id: string){
    const { data, error } = await supabase
        .from("hosts")
        .insert([{ event_id, user_id }])
        .select(hostBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function deleteHost(event_id: string, user_id: string){
    const { data, error } = await supabase
        .from("hosts")
        .delete()
        .select(hostBody)
        .eq("event_id", event_id)
        .eq("user_id", user_id)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}