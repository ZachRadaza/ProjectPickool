import type { Clubs, Club_Members } from "../lib/schemas.js";
import { supabase, supabaseAdmin } from "../lib/supabase.js";

export async function getAllClubs(){
    const { data, error } = await supabaseAdmin
        .from("clubs")
        .select("*");

    if(error)
        throw new Error(error.message);

    return data;
}

export async function getClub(id: string){
    const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", id)
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}

export async function addClub(club: Clubs){
    const { data, error } = await supabase
        .from("clubs")
        .insert([club])
        .select("*")
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
        .select("*")
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
        .select("*")
        .single();

    if(error)
        throw new Error(error.message);

    return data;
}