import type { Events } from "../lib/schemas.js";
import { supabase, supabaseAdmin } from "../lib/supabase.js";

const seriesBody = `
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
    approve_window
`;

export async function getAllEventSeries(){
    const { data, error } = await supabaseAdmin
        .from("event_series")
        .select(seriesBody);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getEventSeries(series_id: string){
    const { data, error } = await supabase
        .from("event_series")
        .select(seriesBody)
        .eq("id", series_id)
        .maybeSingle();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClubEventSeries(club_id: string){
    const { data, error } = await supabase
        .from("event_series")
        .select(seriesBody)
        .eq("club_id", club_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function addEventSeries(series: Events){
    const { data: event_series, error: series_error } = await supabase
        .from("event_series")
        .insert([series])
        .select(seriesBody)
        .single();

    if(series_error)
        throw new Error(series_error.message);

    const { data: events, error: events_error } = await supabaseAdmin.rpc(
        "generate_recurring_events_for_series",
        { p_series_id: event_series.id }
    );

    if(events.length > 0)
        return events[0];
    else 
        return [];
}

export async function updateEventSeries(series_id: string, updates: Partial<Events>){
    const { data: event_series, error: series_error } = await supabase
        .from("event_series")
        .update(updates)
        .eq("id", series_id)
        .select(seriesBody)
        .single();

    if(series_error)
        throw new Error(series_error.message);

    const { data: events, error: event_error } = await supabase
        .rpc("update_recurring_events_for_series", {
            p_series_id: series_id
        });

    if(event_error)
        throw new Error(event_error.message);

    return event_series;
}

export async function deleteEventSeries(series_id: string){
    await supabase.rpc("delete_future_events_for_series", {
        p_series_id: series_id
    });

    const { data: event_series, error: series_error } = await supabase
        .from("event_series")
        .delete()
        .eq("id", series_id);

    if(series_error)
        throw new Error(series_error.message);

    return event_series;
}