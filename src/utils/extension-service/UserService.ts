import type { UserClubs, UserHeader, Users } from "../schemas";
import { supabase } from "../supabase";
import { LocationService } from "./LocationService";
import { StorageService } from "./StorageService";

const userBody = `
    id,
    username,
    email,
    profile_pic,
    profile_pic_path,
    description,
    phone,
    location:locations(*),
    created_at
`;

export const UserService = {
    async getUser(id: string){
        try{
            const { data, error } = await supabase
                .from("users")
                .select(userBody)
                .eq("id", id)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToUser(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getCurrentUser(){
        try{
            const { data, error } = await supabase
                .auth
                .getUser();

            if(error)
                return;

            const user: UserHeader | null = await this.getUserHeader(data.user.id);

            return user;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserHeader(user_id: string){
        try{
            const { data, error } = await supabase
                .from("users")
                .select(`
                    id,
                    username,
                    profile_pic,
                    location:locations(*)
                `)
                .eq("id", user_id)
                .single();

            if(error)
                throw new Error(error.message);

            const user: UserHeader | null = this.convertToUserHeader(data);

            return user;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addUser(userRaw: Users, password: string){
        try{
            const email = userRaw.email;

            const { data: dataAuth, error: errorAuth } = await supabase
                .auth
                .signUp({ email, password });

            if(errorAuth)
                return false;

            const id = dataAuth?.user?.id;

            const user = { ...userRaw, id: id };

            const { data: dataUser, error: errorUser } = await supabase
                .from("users")
                .insert([user])
                .select(userBody)
                .single();

            if(errorUser)
                throw new Error(errorUser.message);

            return this.convertToUser(dataUser);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async resendEmailUser(email: string){
        try{    
            const { data, error } = await supabase
                .auth
                .resend({
                    type: "signup",
                    email: email
                });

            if(error)
                return false;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async loginUser(email: string, password: string){
        try{
            const { data, error } = await supabase
                .auth
                .signInWithPassword({ email, password });

            if(error)
                return false;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async logoutUser(){
        try{
            const { error } = await supabase
                .auth
                .signOut();

            if(error)
                throw new Error(error.message);

        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateUser(id: string, user: Partial<Users>){
        try{        
            const { profile_pic_file, location, ...updates } = user;
            
            if(profile_pic_file){
                const upload = await StorageService.uploadProfilePic(profile_pic_file, id);

                if(typeof user.profile_pic_path === "string")
                    await StorageService.deleteImage(user.profile_pic_path);

                updates.profile_pic = upload.publicUrl;
                updates.profile_pic_path = upload.path;
            }

            if(location && !location.id){
                const locationNew = await LocationService.locationExists(location);
                updates.location_id = locationNew.id;
            }

            const { data, error } = await supabase
                .from("users")
                .update(updates)
                .eq("id", id)
                .select(userBody)
                .single();

            if(error)
                throw new Error(error.message);

            return this.convertToUser(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteUser(id: string){
        try{
            const { data, error } = await supabase
                .from("users")
                .delete()
                .eq("id", id)
                .select("*")
                .single();

            if(error)
                throw new Error(error.message);

            if(data.profile_pic_path)
                StorageService.deleteImage(data.profile_pic_path);

            return this.convertToUser(data);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserClubs(id: string){
        try{
            const { data, error } = await supabase
                .from("club_members")
                .select(`
                    club:clubs(*),
                    role,
                    is_favorite,
                    level,
                    is_level_approved,
                    created_at
                `)
                .eq("user_id", id);

            if(error)
                throw new Error(error.message);

            const clubs: any[] = data.map((userClub) => this.convertToUserClubs(userClub));
            const noNulls: UserClubs[] = clubs.filter((club) => club !== null);

            return noNulls;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    convertToUser(data: any){
        if(data === null)
            return null;

        const user: Users = {
            id: data.id,
            username: data.username,
            email: data.email,
            profile_pic: data.profile_pic,
            profile_pic_path: data.profile_pic_path,
            location: data.location,
            description: data.description,
            phone: data.phone,
            created_at: data.created_at
        };

        return user;
    },

    convertToUserHeader(data: any){
        if(data === null)
            return null;

        const user: UserHeader = {
            id: data.id,
            username: data.username,
            profile_pic: data.profile_pic,
            location: data.location,
        };

        return user;
    },

    convertToUserClubs(data: any){
        if(data === null)
            return null;

        const club: UserClubs = {
            club: data.club,
            role: data.role,
            is_favorite: data.is_favorite,
            level: data.level,
            is_level_approved: data.is_level_approved,
            created_at: data.created_at
        };

        return club;
    }
};