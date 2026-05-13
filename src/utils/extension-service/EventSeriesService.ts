import type { Events } from "../schemas";
import { supabase, supabaseAdmin } from "../supabase";

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

export const EventSeriesService = {
    async getAllEventSeries(){
        try{
            const { data, error } = await supabaseAdmin
                .from("event_series")
                .select(seriesBody);

            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getEventSeries(series_id: string){
        try{
            const { data, error } = await supabase
                .from("event_series")
                .select(seriesBody)
                .eq("id", series_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubEventSeries(club_id: string){
        try{
            const { data, error } = await supabase
                .from("event_series")
                .select(seriesBody)
                .eq("club_id", club_id);

            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addEventSeries(series: Events){
        try{
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

            if(events_error)
                throw new Error(events_error.message);

            if(events.length > 0)
                return events[0];
            else 
                return null;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateEventSeries(series_id: string, updates: Partial<Events>){
        try{
            const { data: event_series, error: series_error } = await supabase
                .from("event_series")
                .update(updates)
                .eq("id", series_id)
                .select(seriesBody)
                .single();

            if(series_error)
                throw new Error(series_error.message);

            const { error: event_error } = await supabase
                .rpc("update_recurring_events_for_series", {
                    p_series_id: series_id
                });

            if(event_error)
                throw new Error(event_error.message);

            return event_series;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteEventSeries(series_id: string){
        try{
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
        } catch(error){
                console.error("error", error);
            throw error;
        }
    },
};  