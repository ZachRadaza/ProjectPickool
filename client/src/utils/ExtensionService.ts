import type { Club_Members, Club_Requests, Clubs, Events, Players, UserClubRequests, UserClubs, UserHeader, Users } from "./schemas";
import { supabase } from "./supabase";

const apiUrl = "http://localhost:3000/api";
const userApiUrl = `${apiUrl}/users`;
const clubApiUrl = `${apiUrl}/clubs`;
const clubRequestApiUrl = `${apiUrl}/clubrequests`;
const clubMemberApiUrl = `${apiUrl}/clubmembers`;
const eventApiUrl = `${apiUrl}/events`;
const playerApiUrl = `${apiUrl}/players`;

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

    async getNearbyClubs(user_id: string){
        try{
            const req = await fetch(`${clubApiUrl}/near/${user_id}`, {
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

    async getQueryClubs(query: string){
        try{
            const req = await fetch(`${clubApiUrl}/query/${query}`, {
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

    async getQueryNearbyClubs(user_id: string, query: string){
        try{
            const req = await fetch(`${clubApiUrl}/querynear/${user_id}/${query}`, {
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

    async addClub(club: Clubs, owner_id: string){
        try{
            const form = new FormData();

            form.append("owner_id", owner_id);
            if(club.name) form.append("name", club.name);
            if(club.description) form.append("description", club.description);
            if(club.level) form.append("level", club.level);
            if(club.is_public) form.append("is_public", String(club.is_public));
            if(club.location) form.append("location", JSON.stringify(club.location));
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
            if(club.location) form.append("location", JSON.stringify(club.location));
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

    async getClubUnapproved(club_id: string){
        try{
            const req = await fetch(`${clubMemberApiUrl}/unapproved/${club_id}`, {
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
            const req = await fetch(`${clubMemberApiUrl}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id, club_id }),
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
            const req = await fetch(`${clubMemberApiUrl}/${club_id}/${user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates }),
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
            const req = await fetch(`${clubMemberApiUrl}/${club_id}/${user_id}`, {
                method: "DELETE",
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

    // EVENTS

    async getAllEvents(){
        try{
            const req = await fetch(`${eventApiUrl}/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Events[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getEvent(id: string){
        try{
            const req = await fetch(`${eventApiUrl}/${id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Events = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getClubEvents(club_id: string){
        try{
            const req = await fetch(`${eventApiUrl}/clubs/${club_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Events[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getPossibleUserEvents(user_id: string){
        try{
            const req = await fetch(`${eventApiUrl}/user/${user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Events[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getNearUserEvents(user_id: string){
        try{
            const req = await fetch(`${eventApiUrl}/near/${user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Events[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getQueryEvents(query: string){
        try{
            const req = await fetch(`${eventApiUrl}/query/${query}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Events[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getQueryNearUserEvents(user_id: string, query: string){
        try{
            const req = await fetch(`${eventApiUrl}/querynear/${user_id}/${query}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Events[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addEvent(event: Events){
        try{
            const req = await fetch(`${eventApiUrl}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event }),
                credentials: "include"
            });

            const res = await req.json();

            const data: Events = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateEvent(event_id: string, event: Partial<Events>){
        try{
            const req = await fetch(`${eventApiUrl}/${event_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event }),
                credentials: "include"
            });

            const res = await req.json();

            const data: Events = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deleteEvent(event_id: string){
        try{
            const req = await fetch(`${eventApiUrl}/${event_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Events = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    // PLAYERS

    async getAllPlayers(){
        try{
            const req = await fetch(`${playerApiUrl}/`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Players[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getPlayer(event_id: string, user_id: string){
        try{
            const req = await fetch(`${playerApiUrl}/${event_id}/${user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Players = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getEventPlayers(event_id: string){
        try{
            const req = await fetch(`${playerApiUrl}/events/${event_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Players[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserPlayers(user_id: string){
        try{
            const req = await fetch(`${playerApiUrl}/user/${user_id}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Players[] = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addPlayer(event_id: string, user_id: String, approved: boolean){
        try{
            const req = await fetch(`${playerApiUrl}/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_id, user_id, approved }),
                credentials: "include"
            });

            const res = await req.json();

            const data: Players = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updatePlayer(event_id: string, user_id: string, updates: Partial<Players>){
        try{
            const req = await fetch(`${playerApiUrl}/${event_id}/${user_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updates }),
                credentials: "include"
            });

            const res = await req.json();

            const data: Players = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deletePlayer(event_id: string, user_id: string){
        try{
            const req = await fetch(`${playerApiUrl}/${event_id}/${user_id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            });

            const res = await req.json();

            const data: Players = res.data;

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },
};