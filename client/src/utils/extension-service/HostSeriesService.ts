import { supabase, supabaseAdmin } from "../supabase";

const hostSeriesBody = `
    event_series_id,
    user:users(
        id,
        username,
        profile_pic
    ),
    created_at
`;

export const HostSeriesService = {
    async getAllHostSeries(){
        const { data, error } = await supabaseAdmin
            .from("host_series")
            .select(hostSeriesBody);

        if(error)
            throw new Error(error.message);

        return data;
    },

    async getHostSeries(event_series_id: string, user_id: string){
        const { data, error } = await supabase
            .from("host_series")
            .select(hostSeriesBody)
            .eq("event_series_id", event_series_id)
            .eq("user_id", user_id)
            .maybeSingle();

        if(error)
            throw new Error(error.message);

        return data;
    },

    async getHostsOfEventSeries(event_series_id: string){
        const { data, error } = await supabase
            .from("host_series")
            .select(hostSeriesBody)
            .eq("event_series_id", event_series_id);

        if(error)
            throw new Error(error.message);

        return data;
    },

    async addHostSeries(event_series_id: string, user_id: string){
        const { error: series_error } = await supabase
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

        return hosts[0] ?? null;
    },

    async deleteHostSeries(event_series_id: string, user_id: string){
        const { error: series_error } = await supabase
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

        return hosts[0] ?? null;
    }
};