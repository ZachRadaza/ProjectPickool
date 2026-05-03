import type { Events } from "../lib/schemas.js";
import { supabase, supabaseAdmin } from "../lib/supabase.js";

const eventBody = `
    id,
    name,
    club:clubs(
        id,
        name,
        profile_pic
    ),
    start_time,
    end_time,
    location:locations(*),
    price,
    description,
    is_auto_approve,
    is_singles,
    event_type,
    sex,
    level,
    max_players,
    recurring,
    approve_window,
    series_id
`;

export async function getAllEvents(){
    const { data, error } = await supabaseAdmin
        .from("events")
        .select(eventBody);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getEvent(id: string){
    const { data, error } = await supabase
        .from("events")
        .select(eventBody)
        .eq("id", id)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClubEvents(club_id: string){
    const { data, error } = await supabase
        .from("events")
        .select(eventBody)
        .eq("club_id", club_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getPossibleUserClubEvents(user_id: string){
    const { data: clubData, error: clubError } = await supabase
        .from("club_members")
        .select("club_id")
        .eq("user_id", user_id);

    if(clubError)
        throw new Error(clubError.message);

    const club_ids = clubData.map((club) => club.club_id);

    if(club_ids.length === 0)
        return [];

    const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(eventBody)
        .in("club_id", club_ids);

    if(eventError)
        throw new Error(eventError.message);

    return eventData;
}

export async function getPossibleUserLocationEvents(user_id: string){
    const { data, error } = await supabase.rpc("get_nearby_events", {
        p_user_id: user_id,
        p_radius_km: 40
    });

    if(error) 
        throw new Error(error.message);

    return data;
}

export async function getQueryEvents(query: string){
    if(!query.trim()) 
        return [];

    const { data, error } = await supabase
        .from("events")
        .select(eventBody)
        .ilike("name", `%${query}%`)
        .limit(50);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getQueryNearbyEvents(user_id: string, query: string){
    if(!query.trim())
        return [];

    const { data, error } = await supabase.rpc("get_nearby_events", {
        p_user_id: user_id,
        p_radius_km: 40
    });

    if(error)
        throw new Error(error.message);

    if(!data)
        return [];

    const filtered = data.filter((event: Events) => event.name.toLowerCase().includes(query.toLowerCase()));

    return filtered;
}

export async function addEvent(event: Event){
    const { data, error } = await supabase
        .from("events")
        .insert([event])
        .select(eventBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function updateEvent(id: string, event: Partial<Event>){
    const { data, error } = await supabase
        .from("events")
        .update(event)
        .eq("id", id)
        .select(eventBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function deleteEvent(id: string){
    const { data, error } = await supabase
        .from("events")
        .delete()
        .eq("id", id)
        .select(eventBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}