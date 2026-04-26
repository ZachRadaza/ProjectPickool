import type { Clubs, Club_Members } from "../lib/schemas.js";
import { supabase, supabaseAdmin } from "../lib/supabase.js";

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

export async function getAllClubs(){
    const { data, error } = await supabaseAdmin
        .from("clubs")
        .select(clubBody);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClub(id: string){
    const { data, error } = await supabase
        .from("clubs")
        .select(clubBody)
        .eq("id", id)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getNearbyClubs(user_id: string) {
    const { data, error } = await supabase.rpc("get_nearby_clubs", {
        p_user_id: user_id,
        p_radius_km: 40
    });

    if(error)
        throw new Error(error.message);

    return data ?? [];
}

export async function getQueryClubs(query: string){
    if(!query.trim())
        return [];

    const { data, error } = await supabase
        .from("clubs")
        .select(clubBody)
        .ilike("name", `%${query}%`)
        .limit(50);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getQueryNearbyClubs(user_id: string, query: string){
    if(!query.trim())
        return [];

    const { data, error } = await supabase.rpc("get_nearby_clubs", {
        p_user_id: user_id,
        p_radius_km: 40
    });

    if(error)
        throw new Error(error.message);

    const filtered = data.filter((club: Clubs) => club.name.toLowerCase().includes(query.toLowerCase()));

    return filtered;
}

export async function addClub(club: Clubs){
    const { data, error } = await supabase
        .from("clubs")
        .insert([club])
        .select(clubBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function updateClub(id: string, updatedClub: Partial<Omit<Clubs, "id">>){
    const { data, error } = await supabase
        .from("clubs")
        .update(updatedClub)
        .eq("id", id)
        .select(clubBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function deleteClub(id: string){
    const { data, error } = await supabase
        .from("clubs")
        .delete()
        .eq("id", id)
        .select(clubBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}