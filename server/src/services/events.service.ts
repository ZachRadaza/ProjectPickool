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

export async function getPossibleUserLocationEvents(user_id: string, page: number){
    const pageSize = 10;
    const { data, error } = await supabase.rpc("get_nearby_events", {
        p_user_id: user_id,
        p_radius_km: 20,
        p_page: page,
        p_page_size: pageSize + 1
    });

    if(error) 
        throw new Error(error.message);

    const hasMore = (data?.length ?? 0) > pageSize;
    const events = data?.slice(0, pageSize) ?? [];

    return { data: events, hasMore };
}

export async function getQueryEvents(query: string, page: number){
    if(!query.trim()) 
        return { data: [], hasMore: false };

    const pageSize = 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
        .from("events")
        .select(eventBody)
        .ilike("name", `%${query.trim()}%`)
        .order("created_at", { ascending: false })
        .range(from, to + 1);

    if(error)
        throw new Error(error.message);

    const hasMore = data.length > pageSize;
    const trimmedData = data.slice(0, pageSize);

    return { data: trimmedData, hasMore };
}

export async function getQueryNearbyEvents(user_id: string, query: string, page: number){
    if(!query.trim())
        return { data: [], hasMore: false };

    const pageSize = 10;
    const { data, error } = await supabase.rpc("get_nearby_events", {
        p_user_id: user_id,
        p_radius_km: 20,
        p_page: page,
        p_page_size: pageSize + 1
    });

    if(error)
        throw new Error(error.message);

    if(!data)
        return { data: [], hasMore: false };

    const events = data?.slice(0, pageSize) ?? [];
    const filtered = events.filter((event: Events) => event.name.toLowerCase().includes(query.toLowerCase()));
    const hasMore = (data?.length ?? 0) > pageSize;

    return { data: filtered, hasMore };
}

export async function getTopEvents(page: number){
    const pageSize = 10;
    const { data, error } = await supabase.rpc('get_top_events', {
        page_number: page,
        page_size: pageSize + 1,
    });

    if(error)
        throw new Error(error.message);
    
    if(!data)
        return { data: [], hasMore: false };

    const hasMore = (data?.length ?? 0) > pageSize;
    const events = data?.slice(0, pageSize) ?? [];

    return { data: events, hasMore };
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