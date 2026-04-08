import type { Club_Members, Club_Requests, Clubs, UserClubRequests, UserClubs, UserHeader, Users } from "./schemas";
import { supabase } from "./supabase";

const apiUrl = "http://localhost:3000/api";
const userApiUrl = `${apiUrl}/users`;
const clubApiUrl = `${apiUrl}/clubs`;
const clubRequestApiUrl = `${apiUrl}/clubrequests`;
const clubMemberApiUrl = `${apiUrl}/clubmembers`;

export const ExtensionService = {

    // USERS

    async getUser(id: string){
        try{
            const req = await fetch(`${userApiUrl}/${id}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const dataRet: Users = res.data;

            return dataRet;
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

            const req = await fetch(`${userApiUrl}/header/${data.user.id}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const user: UserHeader = res.data;

            return user;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserHeader(user_id: string){
        try{
            const req = await fetch(`${userApiUrl}/header/${user_id}`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const user: UserHeader = res.data;

            return user;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getAllUser(){
        try{
            const req = await fetch(`${userApiUrl}/`, {
                method: 'GET',
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Users[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addUser(userRaw: Users, password: string){
        try{
            const email = userRaw.email;

            const { data, error } = await supabase
                .auth
                .signUp({ email, password });

            if(error)
                return false;

            const id = data?.user?.id;

            const user = { ...userRaw, id: id };

            const req = await fetch(`${userApiUrl}/`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user }),
                credentials: "include"
            });

            const res = await req.json();

            const dataRet: Users = res.data;

            return dataRet;
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
            const form = new FormData();

            if(user.description) form.append("description", user.description);
            if(user.location) form.append("location", JSON.stringify(user.location));
            if(user.phone) form.append("phone", user.phone);
            if(user.username) form.append("username", user.username);
            if(user.profile_pic_file) form.append("profile_pic_file", user.profile_pic_file);
            if(user.profile_pic_path) form.append("profil_pic_path", user.profile_pic_path);

            const req = await fetch(`${userApiUrl}/${id}`, {
                method: "PUT",
                body: form,
                credentials: "include"
            });

            const res = await req.json();

            const updatedUser: Users = res.data;

            return updatedUser;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteUser(id: string){
        try{
            const req = await fetch(`${userApiUrl}/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserClubs(id: string){
        try{
            const req = await fetch(`${userApiUrl}/clubs/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();
            const data: UserClubs[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    // CLUBS

    async getAllClubs(){
        try{
            const req = await fetch(`${clubApiUrl}/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();
            const data: Clubs[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClub(id: string){
        try{
            const req = await fetch(`${clubApiUrl}/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();
            const data: Clubs = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addClub(club: Clubs, owner_id: string){
        try{
            const form = new FormData();

            form.append("owner_id", owner_id);
            if(club.name) form.append("name", club.name);
            if(club.description) form.append("description", club.description);
            if(club.level) form.append("level", club.level);
            if(club.is_public) form.append("is_public", String(club.is_public));
            if(club.location) form.append("location", JSON.stringify(location));
            if(club.banner_file) form.append("banner_file", club.banner_file);
            if(club.profile_pic_file  instanceof File) form.append("profile_pic_file", club.profile_pic_file);

            const req = await fetch(`${clubApiUrl}/`, {
                method: "POST",
                body: form,
                credentials: "include"
            });

            const res = await req.json();
            const data: Clubs = res.data;

            console.log("res", res);
            console.log("data", data);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateClub(id: string, club: Partial<Clubs>, user_id: string){
        try{
            const form = new FormData();

            form.append("user_id", user_id);
            if(club.name) form.append("name", club.name);
            if(club.description) form.append("description", club.description);
            if(club.level) form.append("level", club.level);
            if(club.is_public !== undefined) form.append("is_public", String(club.is_public));
            if(club.location) form.append("location", JSON.stringify(location));
            if(club.profile_pic_file  instanceof File) form.append("profile_pic_file", club.profile_pic_file);
            if(club.profile_pic_path) form.append("profile_pic_path", club.profile_pic_path);
            if(club.banner_file  instanceof File) form.append("banner_file", club.banner_file);            
            if(club.banner_path) form.append("banner_path", club.banner_path);

            const req = await fetch(`${clubApiUrl}/${id}`, {
                method: "PUT",
                body: form,
                credentials: "include"
            });

            const res = await req.json();
            const data: Clubs = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteClub(club_id: string, user_id: string){
        try{
            const req = await fetch(`${clubApiUrl}/${club_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id }),
                credentials: "include"
            });

            const res = await req.json();
            const data = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    // CLUB REQUESTS

    async getAllRequests(){
        try{
            const req = await fetch(`${clubRequestApiUrl}/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Requests[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubRequests(club_id: string){
        try{
            const req = await fetch(`${clubRequestApiUrl}/${club_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Requests[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserRequests(user_id: string){
        try{
            const req = await fetch(`${clubRequestApiUrl}/users/${user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: UserClubRequests[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserClubRequest(user_id: string, club_id: string){
        try{
            const req = await fetch(`${clubRequestApiUrl}/users/${user_id}/${club_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();
            
            const data: Club_Requests = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addClubRequests(club_id: string, user_id: string){
        try{
            const req = await fetch(`${clubRequestApiUrl}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ club_id, user_id }),
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Requests = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getNumClubRequests(club_id: string){
        try{
            const req = await fetch(`${clubRequestApiUrl}/num/${club_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: number = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async approveClubRequest(club_id: string, user_id: string){
        try{
            const req = await fetch(`${clubRequestApiUrl}/approve/${user_id}/${club_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Requests = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async denyClubRequest(club_id: string, user_id: string){
        try{
            console.log("user", user_id);
            console.log("club", club_id);
            const req = await fetch(`${clubRequestApiUrl}/deny/${user_id}/${club_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });
            console.log("1");

            const res = await req.json();
            console.log("2")

            const data: Club_Requests = res.data;
            console.log("3");

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    // CLUB MEMBERS

    async getAllClubMembers(){
        try{
            const req = await fetch(`${clubMemberApiUrl}/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubMembers(club_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/${club_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubAdmins(club_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/admins/${club_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubOwner(club_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/owner/${club_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubMembersNum(club_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/num/${club_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: number = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getSingleClubMember(club_id: string, user_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/single/${club_id}/${user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getBasicClubMember(club_id: string, user_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/basic/${club_id}/${user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addClubMember(club_id: string, user_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/${club_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id }),
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateClubMember(club_id: string, user_id: string, updates: Partial<Club_Members>){
        try{
            const req = await fetch(`${clubMemberApiUrl}/${club_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, updates }),
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteClubMember(club_id: string, user_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/${club_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id }),
                credentials: "include"
            });

            const res = await req.json();

            const data: Club_Members = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    }
};