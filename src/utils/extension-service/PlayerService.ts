import type { Players } from "../schemas";
import { supabase } from "../supabase";

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

export const PlayerService = {

    async getPlayer(event_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("players")
                .select(playerBody)
                .eq("event_id", event_id)
                .eq("user_id", user_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToPlayer(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getEventPlayers(event_id: string){
        try{
            const { data, error } = await supabase
                .from("players")
                .select(playerBody)
                .eq("event_id", event_id)

            if(error)
                throw new Error(error.message);

            return this.convertListOfPlayers(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserPlayers(user_id: string){
        try{
            const { data, error } = await supabase
                .from("players")
                .select("event_id, approved")
                .eq("user_id", user_id);

            if(error)
                throw new Error(error.message);

            return this.convertListOfPlayers(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addPlayer(event_id: string, user_id: String, approved: boolean, paid: boolean){
        try{
            const { data, error } = await supabase
                .from("players")
                .insert([{ event_id, user_id, approved, paid }])
                .select(playerBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToPlayer(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updatePlayer(event_id: string, user_id: string, updates: Partial<Players>){
        try{
            const { data, error } = await supabase
                .from("players")
                .update(updates)
                .select(playerBody)
                .eq("user_id", user_id)
                .eq("event_id", event_id)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToPlayer(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deletePlayer(event_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("players")
                .delete()
                .select(playerBody)
                .eq("user_id", user_id)
                .eq("event_id", event_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToPlayer(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    convertToPlayer(data: any){
        if(data === null)
            return null;

        const player: Players = {
            event_id: data.event_id,
            user: data.user,
            approved: data.approved,
            paid: data.paid,
            approved_at: data.approved_at,
            created_at: data.created_at
        };

        return player;
    },

    convertListOfPlayers(data: any[]){
        const toPlayers = data.map((player) => this.convertToPlayer(player));
        const trimmed: Players[] = toPlayers.filter((player) => player !== null);

        return trimmed;
    }
};