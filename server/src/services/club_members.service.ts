import { Level, type Club_Members } from "../lib/schemas.js";
import { supabase } from "../lib/supabase.js";

const clubMemberBody = `
    user:users(
        id,
        username,
        profile_pic
    ),
    role,
    is_favorite,
    level,
    is_level_approved,
    created_at
`;

export async function getAllClubMembers(){
    const { data, error } = await supabase
        .from("club_members")
        .select(clubMemberBody)
        
    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClubMembers(club_id: string){
    const { data, error } = await supabase
        .from("club_members")
        .select(clubMemberBody)
        .eq("club_id", club_id)
        .eq("role", "member");

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClubAdmins(club_id: string){
    const { data, error } = await supabase
        .from("club_members")
        .select(clubMemberBody)
        .eq("club_id", club_id)
        .eq("role", "admin");

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClubOwner(club_id: string){
    const { data, error } = await supabase
        .from("club_members")
        .select(clubMemberBody)
        .eq("club_id", club_id)
        .eq("role", "owner")
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClubUnapproved(club_id: string){
    const { data, error } = await supabase
        .from("club_members")
        .select(clubMemberBody)
        .eq("club_id", club_id)
        .eq("is_level_approved", false)
        .neq("level", Level.UNSET);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getSingleClubMember(club_id: string, user_id: string){
    const { data } = await supabase
        .from("club_members")
        .select(clubMemberBody)
        .eq("user_id", user_id)
        .eq("club_id", club_id)
        .maybeSingle();

    return data;
}

export async function getBasicClubMember(club_id: string, user_id: string){
    const { data } = await supabase
        .from("club_members")
        .select("*")
        .eq("user_id", user_id)
        .eq("club_id", club_id)
        .maybeSingle();

    return data;
}

export async function getClubMembersNum(club_id: string){
    const { count, error } = await supabase
        .from("club_members")
        .select("*", { count: "exact", head: true })
        .eq("club_id", club_id);

    if(error)
        throw new Error(error.message);

    return count;
}

export async function addClubMember(club_id: string, user_id: string, isOwner: boolean){
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

    return data;
}

export async function updateClubMember(club_id: string, user_id: string, updates: Partial<Club_Members>){
    const { data, error } = await supabase
        .from("club_members")
        .update(updates)
        .eq("user_id", user_id)
        .eq("club_id", club_id)
        .select(clubMemberBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function deleteClubMember(club_id: string, user_id: string){
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
}