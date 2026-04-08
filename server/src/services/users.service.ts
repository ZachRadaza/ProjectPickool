import type { Users } from "../lib/schemas.js";
import { supabase, supabaseAdmin } from "../lib/supabase.js";
import * as locationService from "./location.service.js";

const userBody = `
    id,
    username,
    email,
    profile_pic,
    description,
    phone,
    location:locations(*),
    created_at
`;

export async function getAllUser(){
    const { data, error } = await supabaseAdmin
        .from('users')
        .select(userBody);

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getUser(id: string){
    const { data, error } = await supabase
        .from("users")
        .select(userBody)
        .eq("id", id)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getUserHeader(id: string){
    const { data, error } = await supabase
        .from("users")
        .select(`
            id,
            username,
            profile_pic    
        `)
        .eq("id", id)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getUserClubs(id: string){
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

    return data;
}

export async function addUser(user: Users){
    const { data, error } = await supabaseAdmin
        .from("users")
        .insert([user])
        .select(userBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function updateUser(id: string, updates: Partial<Omit<Users, "id">>){
    const { data, error } = await supabaseAdmin
        .from("users")
        .update(updates)
        .eq("id", id)
        .select(userBody)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function deleteUser(id: string){
        const { data, error } = await supabaseAdmin
        .from("users")
        .delete()
        .eq("id", id)
        .select("*")
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}