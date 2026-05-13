import { Level, type Club_Members } from "../schemas";
import { supabase } from "../supabase";

const clubMemberBody = `
    user:users!inner(
        id,
        username,
        profile_pic
    ),
    club_id,
    role,
    is_favorite,
    level,
    is_level_approved,
    created_at
`;

export const ClubMemberService = {
    async getAllClubMembers(){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .select(clubMemberBody)
                
            if(error)
                throw new Error(error.message);

            const members: Club_Members[] = this.convertListOfClubMembers(data);

            return members;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubMembers(club_id: string, page: number){
        try{
            const pageSize = 20;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from("club_members")
                .select(clubMemberBody)
                .eq("club_id", club_id)
                .eq("role", "member")
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const converted = this.convertListOfClubMembers(trimmedData);

            return { data: converted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubAdmins(club_id: string){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .select(clubMemberBody)
                .eq("club_id", club_id)
                .eq("role", "admin");

            if(error)
                throw new Error(error.message);

            const converted = this.convertListOfClubMembers(data);

            return converted;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubOwner(club_id: string){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .select(clubMemberBody)
                .eq("club_id", club_id)
                .eq("role", "owner")
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToClubMembers(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubUnapproved(club_id: string){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .select(clubMemberBody)
                .eq("club_id", club_id)
                .eq("is_level_approved", false)
                .neq("level", Level.UNSET);

            if(error)
                throw new Error(error.message);

            const converted = this.convertListOfClubMembers(data);

            return converted;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },


    async getClubMembersNum(club_id: string){
        try{
            const { count, error } = await supabase
                .from("club_members")
                .select("*", { count: "exact", head: true })
                .eq("club_id", club_id);

            if(error)
                throw new Error(error.message);

            return count;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getSingleClubMember(club_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .select(clubMemberBody)
                .eq("user_id", user_id)
                .eq("club_id", club_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToClubMembers(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getBasicClubMember(club_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .select("*")
                .eq("user_id", user_id)
                .eq("club_id", club_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);
            
            return this.convertToClubMembers(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getQueryClubMembers(club_id: string, query: string, page: number){
        try{
            if(!query.trim())
                return { data: [], hasMore: false };

            const pageSize = 10;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data ,error } = await supabase
                .from("club_members")
                .select(clubMemberBody)
                .eq("club_id", club_id)
                .ilike("users.username", `%${query}%`)
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const membersConverted = this.convertListOfClubMembers(trimmedData);

            return { data: membersConverted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addClubMember(club_id: string, user_id: string, isOwner: boolean | false){
        try{
            const insertContent: any = { club_id: club_id , user_id: user_id };

            if(isOwner)
                insertContent.role = "owner";

            const { data, error } = await supabase
                .from("club_members")
                .insert([insertContent])
                .select(clubMemberBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToClubMembers(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateClubMember(club_id: string, user_id: string, updates: Partial<Club_Members>){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .update(updates)
                .eq("user_id", user_id)
                .eq("club_id", club_id)
                .select(clubMemberBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToClubMembers(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteClubMember(club_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .delete()
                .eq("user_id", user_id)
                .eq("club_id", club_id)
                .select("*")
                .single();

            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    convertToClubMembers(data: any){
        if(data === null)
            return null;

        const clubMember: Club_Members = {
            user: data.user,
            user_id: data.user_id,
            club_id: data.club_id,
            role: data.role,
            is_favorite: data.is_favorite,
            level: data.level,
            is_level_approved: data.is_level_approved,
            created_at: data.created_at
        };

        return clubMember;
    },

    convertListOfClubMembers(data: any[]){
        const members: any[] = data.map((member) => this.convertToClubMembers(member));
        const cleared: Club_Members[] = members.filter((mem) => mem !== null);

        return cleared
    }
};