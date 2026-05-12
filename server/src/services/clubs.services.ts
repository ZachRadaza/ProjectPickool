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

export async function getNearbyClubs(user_id: string, page: number) {
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

    return { data: clubs, hasMore };
}

export async function getQueryClubs(query: string, page: number){
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

    return { data: trimmedData, hasMore };
}

export async function getQueryNearbyClubs(user_id: string, query: string, page: number){
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
    const clubs = data?.slice(0, pageSize) ?? [];
    const filtered = clubs.filter((club: Clubs) => club.name.toLowerCase().includes(query.toLowerCase()));

    return { data: filtered, hasMore };
}

export async function getTopClubs(page: number){
    const pageSize = 10;
    const { data, error } = await supabase.rpc('get_top_clubs', {
        page_number: page,
        page_size: pageSize + 1
    });

    if(error)
        throw new Error(error.message);

    const hasMore = data.length > pageSize;
    const trimmedData = data.slice(0, pageSize);

    return { data: trimmedData, hasMore };
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