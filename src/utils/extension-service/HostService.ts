import type { Hosts } from "../schemas";
import { supabase, supabaseAdmin } from "../supabase";
import { HostSeriesService } from "./HostSeriesService";

const hostBody = `
    event_id,
    user:users(
        id,
        username,
        profile_pic
    ),
    created_at
`;

export const HostService = {
    async getAllHosts(){
        try{
            const { data, error } = await supabaseAdmin
                .from("hosts")
                .select(hostBody)

            if(error)
                throw new Error(error.message);

            return this.convertListOfHosts(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getHost(event_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("hosts")
                .select(hostBody)
                .eq("event_id", event_id)
                .eq("user_id", user_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.converToHost(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getEventHosts(event_id: string){
        try{
            const { data, error } = await supabase
                .from("hosts")
                .select(hostBody)
                .eq("event_id", event_id);

            if(error)
                throw new Error(error.message);

            return this.convertListOfHosts(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserHost(user_id: string){
        try{
            const { data, error } = await supabase
                .from("hosts")
                .select(hostBody)
                .eq("user_id", user_id);

            if(error)
                throw new Error(error.message);

            return this.convertListOfHosts(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addHost(event_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("hosts")
                .insert([{ event_id, user_id }])
                .select(hostBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.converToHost(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addHostSeries(event_series_id: string, user_id: string){
        try{
            const data = await HostSeriesService.addHostSeries(event_series_id, user_id);

            return this.converToHost(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteHost(event_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("hosts")
                .delete()
                .select(hostBody)
                .eq("event_id", event_id)
                .eq("user_id", user_id)
                .single();

            if(error)
                throw new Error(error.message);

            return this.converToHost(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteHostSeries(event_series_id: string, user_id: string){
        try{
            const data = await HostSeriesService.deleteHostSeries(event_series_id, user_id);

            return this.converToHost(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    converToHost(data: any){
        if(data === null)
            return;

        const host: Hosts = {
            event_id: data.event_id,
            user: data.user,
            created_at: data.created_at
        };

        return host;
    }, 

    convertListOfHosts(data: any[]){
        const hosts: any[] = data.map((host) => this.converToHost(host));
        const converted: Hosts[] = hosts.filter((host) => host !== null);

        return converted;
    }
};