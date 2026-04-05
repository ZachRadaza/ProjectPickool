import type { RequestStatus } from "../lib/schemas.js";
import { supabase, supabaseAdmin } from "../lib/supabase.js";

const clubRequestBody = `
    id,
    user:users(
        id,
        username,
        profile_pic
    ),
    club_id,
    status,
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
        .from("club_members")
        .select(clubRequestBody)
        .eq("club_id", club_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getUserRequests(user_id: string){
    const { data, error } = await supabase
        .from("club_members")
        .select("*")
        .eq("user_id", user_id);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function addClubRequests(club_id: string, user_id: string){
    const { data, error } = await supabase
        .from("club_members")
        .insert([{ club_id, user_id }])
        .select(clubRequestBody);

    if(error)
        throw new Error(error.message);
    
    return data;
}

export async function updateClubRequests(id: string, status: RequestStatus){
    const { data, error } = await supabase
        .from("club_members")
        .update({ status: status })
        .select(clubRequestBody)
        .eq("id", id)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function deleteClubRequests(id: string){
    const { data, error } = await supabase
        .from("club_members")
        .delete()
        .eq("id", id)
        .select("*")
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}