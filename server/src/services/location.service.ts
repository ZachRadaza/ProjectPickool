import { supabase, supabaseAdmin } from "../lib/supabase.js";
import type { Locations } from "../lib/schemas.js";

export async function getAllLocation(){
    const { data, error } = await supabase
        .from("locations")
        .select("*");
    
    if(error)
        throw new Error(error.message);

    return data;    
}

export async function getLocation(id: string){
    const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("id", id)
        .single();
    
    if(error)
        throw new Error(error.message);

    return data;
}

export async function locationExists(location: Locations){
    const { data: getData, error: getError } = await supabase
        .from("locations")
        .select("*")
        .eq("longitude", location.longitude)
        .eq("latitude", location.latitude)
        .limit(1);

    if(getError)
        throw new Error(getError.message);

    if(getData.length > 0)
        return getData[0];

    const addData = await addLocation(location);

    return addData;
}

export async function addLocation(location: Locations){
    const { data, error } = await supabase
        .from("locations")
        .insert([ location ])
        .select("*")
        .single();

    if(error)
        throw new Error(error.message);

    return data;    
}

export async function updateLocation(id: string, location: Locations){
    const { data, error } = await supabase
        .from("locations")
        .update(location)
        .eq("id", id)
        .select("*")
        .single();
    
    if(error)
        throw new Error(error.message);

    return data;    
}

export async function deleteLocation(id: string){
    const { data, error } = await supabase
        .from("locations")
        .delete()
        .eq("id", id);
    
    if(error)
        throw new Error(error.message);

    return data;    
}