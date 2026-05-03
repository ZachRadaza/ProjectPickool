import { supabase, supabaseAdmin } from "../lib/supabase.js";

const hostSeriesBody = `
    event_series_id,
    user:users(
        id,
        username,
        profile_pic
    ),
    created_at
`;
export async function getAllHostSeries(){
    const { data, error } = await supabaseAdmin
        .from("host_series")
        .select(hostSeriesBody);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getHostSeries(event_series_id: string, user_id: string){
    const { data, error } = await supabase
        .from("host_series")
        .select(hostSeriesBody)
        .eq("event_series_id", event_series_id)
        .eq("user_id", user_id)
        .maybeSingle();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getHostsOfEventSeries(event_series_id: string){
    const { data, error } = await supabase
        .from("host_series")
        .select(hostSeriesBody)
        .eq("event_series_id", event_series_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function addHostSeries(event_series_id: string, user_id: string){
    const { data: series_host, error: series_error } = await supabase
        .from("host_series")
        .insert([{ event_series_id, user_id }])
        .select(hostSeriesBody)
        .single();

    if(series_error)
        throw new Error(series_error.message);

    const { data: hosts, error: hosts_error } = await supabase.rpc("backfill_host_series_to_events", {
        p_series_id: event_series_id,
        p_user_id: user_id,
    });

    if(hosts_error) 
        throw new Error(hosts_error.message);

    return series_host;
}

export async function deleteHostSeries(event_series_id: string, user_id: string){
    const { data: series_host, error: series_error } = await supabase
        .from("host_series")
        .delete()
        .select(hostSeriesBody)
        .eq("event_series_id", event_series_id)
        .eq("user_id", user_id);

    if(series_error)
        throw new Error(series_error.message);

    const { data: hosts, error: hosts_error } = await supabase.rpc("remove_host_series_from_events", {
        p_series_id: event_series_id,
        p_user_id: user_id,
    });

    if(hosts_error)
        throw new Error(hosts_error.message);

    return series_host;
}