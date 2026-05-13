import type { Clubs } from "../schemas";
import { supabase, supabaseAdmin } from "../supabase";
import { ClubMemberService } from "./ClubMemberService";
import { LocationService } from "./LocationService";
import { StorageService } from "./StorageService";

const clubBody = `
    id,
    name,
    description,
    location:locations(*),
    is_public,
    banner,
    banner_path,
    profile_pic,
    profile_pic_path,
    level,
    created_at
`;

export const ClubService = {
    async getAllClubs(){
        try{
            const { data, error } = await supabaseAdmin
                .from("clubs")
                .select(clubBody);

            if(error)
                throw new Error(error.message);

            const clubs: Clubs[] = this.convertListOfClubs(data);

            return clubs;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClub(id: string){
        try{
            const { data, error } = await supabase
                .from("clubs")
                .select(clubBody)
                .eq("id", id)
                .single();

            if(error)
                throw new Error(error.message);

            const club = this.convertToClub(data);

            return club;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getNearbyClubs(user_id: string, page: number){
        try{
            const pageSize = 10;
            const { data, error } = await supabase.rpc("get_nearby_clubs", {
                p_user_id: user_id,
                p_radius_km: 20,
                p_page: page,
                p_page_size: pageSize + 1
            });

            if(error)
                throw new Error(error.message);

            const hasMore = (data?.length ?? 0) > pageSize;
            const clubs = data?.slice(0, pageSize) ?? [];
            const clubsConverted = clubs.map((club: Clubs) => this.convertToClub(club));

            return { data: clubsConverted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getQueryClubs(query: string, page: number){
        try{
            if(!query.trim())
                return { data: [], hasMore: false };

            const pageSize = 10;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from("clubs")
                .select(clubBody)
                .ilike("name", `%${query}%`)
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const clubsConverted = this.convertListOfClubs(trimmedData);

            return { data: clubsConverted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getQueryNearbyClubs(user_id: string, query: string, page: number){
        try{
            if(!query.trim())
                return { data: [], hasMore: false };

            const pageSize = 10;
            const { data, error } = await supabase.rpc("get_nearby_clubs", {
                p_user_id: user_id,
                p_radius_km: 20,
                p_page: page,
                p_page_size: pageSize + 1
            });

            if(error)
                throw new Error(error.message);

            const hasMore = (data?.length ?? 0) > pageSize;
            const clubs: any[] = data?.slice(0, pageSize) ?? [];
            const filtered = clubs.filter((club) => club.name.toLowerCase().includes(query.toLowerCase()));
            const clubsConverted = this.convertListOfClubs(filtered);

            return { data: clubsConverted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getTopClubs(page: number){
        try{
            const pageSize = 10;
            const { data, error } = await supabase.rpc('get_top_clubs', {
                page_number: page,
                page_size: pageSize + 1
            });

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData: any[] = data.slice(0, pageSize);
            const converted: any[] = trimmedData.map((club) => this.convertToClub(club));
            const noNulls: Clubs[] = converted.filter((club) => club !== null);

            return { data: noNulls, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addClub(club: Clubs, owner_id: string){
        try{
            const { 
                location,
                profile_pic_file,
                banner_file,
                ...rest
            } = club;
            
            if(location && !location.id){
                const locationNew = await LocationService.locationExists(location);
                rest.location_id = locationNew.id;
            }

            const { data: clubRaw, error: clubRawError } = await supabase
                .from("clubs")
                .insert([club])
                .select(clubBody)
                .single();

            if(clubRawError)
                throw new Error(clubRawError.message);

            await ClubMemberService.addClubMember(clubRaw.id, owner_id, true);

            const updatedClub: Partial<Clubs> = {};

            if(profile_pic_file){
                const upload = await StorageService.uploadClubProfilePic(profile_pic_file, clubRaw.id);
                updatedClub.profile_pic_path = upload.path;
                updatedClub.profile_pic = upload.publicUrl;
            }

            if(banner_file){
                const upload = await StorageService.uploadClubBanner(banner_file, clubRaw.id);
                updatedClub.banner_path = upload.path;
                updatedClub.banner = upload.publicUrl;
            }

            const newClub = await this.updateClub(clubRaw.id, updatedClub);

            return this.convertToClub(newClub);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateClub(id: string, club: Partial<Clubs>){
        try{
            const { 
                location,
                profile_pic_file,
                banner_file,
                ...rest
            } = club;

            if(location && !location.id){
                const locationNew = await LocationService.locationExists(location);
                rest.location_id = locationNew.id;
            }

            if(profile_pic_file){
                const upload = await StorageService.uploadClubProfilePic(profile_pic_file, id);
                rest.profile_pic_path = upload.path;
                rest.profile_pic = upload.publicUrl;
            }

            if(banner_file){
                const upload = await StorageService.uploadClubBanner(banner_file, id);
                rest.banner_path = upload.path;
                rest.banner = upload.publicUrl;
            }

            const { data, error } = await supabase
                .from("clubs")
                .update(rest)
                .eq("id", id)
                .select(clubBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToClub(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteClub(club_id: string){
        try{
            const { data, error } = await supabase
                .from("clubs")
                .delete()
                .eq("id", club_id)
                .select(clubBody)
                .single();

            if(error)
                throw new Error(error.message);

            if(data.profile_pic_path) StorageService.deleteImage(data.profile_pic_path);
            if(data.banner_path) StorageService.deleteImage(data.banner_path);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    convertToClub(data: any){
        if(data === null)
            return null;

        const club: Clubs = {
            id: data.id,
            name: data.name,
            description: data.description,
            location: data.location,
            is_public: data.is_public,
            banner: data.banner,
            banner_path: data.banner_path,
            profile_pic: data.profile_pic,
            profile_pic_path: data.profile_pic_path,
            level: data.level,
            created_at: data.created_at
        };

        return club;
    },

    convertListOfClubs(data: any){
        const clubsWNull: any[] = data.map((club: any) => this.convertToClub(club));
        const clubs: Clubs[] = clubsWNull.filter((club) => club !== null);

        return clubs
    }
};