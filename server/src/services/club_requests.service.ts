import type { Club_Requests, RequestStatus } from "../lib/schemas.js";
import { supabase, supabaseAdmin } from "../lib/supabase.js";

const clubRequestBody = `
    user:users(
        id,
        username,
        profile_pic
    ),
    club_id,
    created_at
`;

export async function getAllRequests(){
    const { data, error } = await supabaseAdmin
        .from("club_requests")
        .select(clubRequestBody);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClubRequests(club_id: string){
    const { data, error } = await supabase
        .from("club_requests")
        .select(clubRequestBody)
        .eq("club_id", club_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getNumClubRequests(club_id: string){
    const { count, error } = await supabase
        .from("club_requests")
        .select(clubRequestBody, { count: "exact", head: true })
        .eq("club_id", club_id);

    if(error)
        throw new Error(error.message);

    return count;
}

export async function getUserRequests(user_id: string){
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

    return data;
}

export async function getUserClubRequest(user_id: string, club_id: string){
    const { data, error } = await supabase
        .from("club_requests")
        .select("*")
        .eq("user_id", user_id)
        .eq("club_id", club_id)
        .maybeSingle();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function addClubRequests(club_id: string, user_id: string){
    const { data, error } = await supabase
        .from("club_requests")
        .insert([{ club_id, user_id }])
        .select(clubRequestBody)
        .single();

    if(error)
        throw new Error(error.message);
    
    return data;
}

export async function deleteClubRequests(club_id: string, user_id: string){
    const { data, error } = await supabase
        .from("club_requests")
        .delete()
        .eq("user_id", user_id)
        .eq("club_id", club_id)
        .select("*")
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}