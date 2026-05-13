import type { Club_Requests, UserClubRequests } from "../schemas";
import { supabase } from "../supabase";
import { ClubMemberService } from "./ClubMemberService";

const clubRequestBody = `
    user:users(
        id,
        username,
        profile_pic
    ),
    club_id,
    created_at
`;

export const ClubRequestService = {

    async getClubRequests(club_id: string){
        try{
            const { data, error } = await supabase
                .from("club_requests")
                .select(clubRequestBody)
                .eq("club_id", club_id);

            if(error)
                throw new Error(error.message);

            const requests: Club_Requests[] = this.convertListOfClubRequests(data);

            return requests;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserRequests(user_id: string){
        try{
            const { data, error } = await supabase
                .from("club_requests")
                .select(`
                    user:users(
                        id,
                        username,
                        profile_pic
                    ),
                    club:clubs(
                        id,
                        name,
                        profile_pic,
                        banner,
                        is_public,
                        location:locations(*)
                    ),
                    created_at
                `)
                .eq("user_id", user_id);

            if(error)
                throw new Error(error.message);

            const userReqs: UserClubRequests[] = this.convertListOfUserClubRequests(data);

            return userReqs;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserClubRequest(user_id: string, club_id: string){
        try{
            const { data, error } = await supabase
                .from("club_requests")
                .select("*")
                .eq("user_id", user_id)
                .eq("club_id", club_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToClubRequest(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addClubRequests(club_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("club_requests")
                .insert([{ club_id, user_id }])
                .select(clubRequestBody)
                .single();

            if(error)
                throw new Error(error.message);
            
            return this.convertToClubRequest(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getNumClubRequests(club_id: string){
        try{
            const { count, error } = await supabase
                .from("club_requests")
                .select(clubRequestBody, { count: "exact", head: true })
                .eq("club_id", club_id);

            if(error)
                throw new Error(error.message);

            return count;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async approveClubRequest(club_id: string, user_id: string){
        try{
            const deletedReq = await this.denyClubRequest(club_id, user_id);
            await ClubMemberService.addClubMember(club_id, user_id, false);

            return deletedReq;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async denyClubRequest(club_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("club_requests")
                .delete()
                .eq("user_id", user_id)
                .eq("club_id", club_id)
                .select("*")
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToClubRequest(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    convertToClubRequest(data: any){
        if(data === null)
            return null;

        const clubRequest: Club_Requests = {
            user: data.user,
            user_id: data.user_id,
            club_id: data.club_id,
            created_at: data.created_at
        };

        return clubRequest;
    },

    convertListOfClubRequests(data: any[]){
        const requestsWNull: any[] = data.map((req) => this.convertToClubRequest(req));
        const requestsWoNull: Club_Requests[] = requestsWNull.filter((req) => req !== null);

        return requestsWoNull;
    },

    convertToUserClubRequest(data: any){
        if(data === null)
            return null;

        const userReq: UserClubRequests = {
            user: data.user,
            club: data.club,
            created_at: data.created_at
        };

        return userReq;
    },

    convertListOfUserClubRequests(data: any[]){
        const requestsWNull: any[] = data.map((req) => this.convertToUserClubRequest(req));
        const requestsWoNull: UserClubRequests[] = requestsWNull.filter((req) => req !== null);

        return requestsWoNull;
    },
};