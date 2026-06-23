import type { Club_Messages } from "../schemas";
import { supabase } from "../supabase";

const clubMessageBody = `
    id,
    user:users(
        id,
        profile_pic,
        username
    ),
    club_id,
    created_at,
    message,
    replying_to:replying_to_id (
        id,
        message,
        user_id
    )
`;

export const ClubMessageService = {
    async getClubMessage(id: string){
        try{
            const { data, error } = await supabase
                .from("club_messages")
                .select(clubMessageBody)
                .eq("id", id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToClubMessage(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubMessages(club_id: string, page: number){
        try{
            const pageSize = 25;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from("club_messages")
                .select(clubMessageBody)
                .eq("club_id", club_id)
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize).reverse();
            const converted = this.convertListOfClubMessage(trimmedData);

            return { data: converted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addClubMessage(user_id: string, club_id: string, message: string, replying_to_id?: string | null){
        try{
            const { data, error } = await supabase
                .from("club_messages")
                .insert([{ user_id, club_id, message, replying_to_id }])
                .select(clubMessageBody)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToClubMessage(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    convertToClubMessage(data: any){
        if(data === null)
            return null;

        const message: Club_Messages = {
            id: data.id,
            club_id: data.club_id,
            user: data.user,
            created_at: data.created_at,
            message: data.message || "",
            replying_to: data.replying_to
        };

        return message;
    },

    convertListOfClubMessage(data: any[]){
        const messages: any[] = data.map((message) => this.convertToClubMessage(message));
        const cleared: Club_Messages[] = messages.filter((message) => message !== null);

        return cleared;
    }
}