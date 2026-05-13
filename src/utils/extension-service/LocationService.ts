import type { Locations } from "../schemas";
import { supabase } from "../supabase";

export const LocationService = {

    async getAllLocation(){
        try{
            const { data, error } = await supabase
                .from("locations")
                .select("*");
            
            if(error)
                throw new Error(error.message);

            return data;    
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getLocation(id: string){
        try{
            const { data, error } = await supabase
                .from("locations")
                .select("*")
                .eq("id", id)
                .single();
            
            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async locationExists(location: Locations){
        try{
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

            const addData = await this.addLocation(location);

            return addData;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addLocation(location: Locations){
        try{
            const { data, error } = await supabase
                .from("locations")
                .insert([ location ])
                .select("*")
                .single();

            if(error)
                throw new Error(error.message);

            return data;    
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updateLocation(id: string, location: Locations){
        try{
            const { data, error } = await supabase
                .from("locations")
                .update(location)
                .eq("id", id)
                .select("*")
                .single();
            
            if(error)
                throw new Error(error.message);

            return data;    
        } catch(error){
            console.error("error", error);
            throw error;
        } 
    },

    async deleteLocation(id: string){
        try{
            const { data, error } = await supabase
                .from("locations")
                .delete()
                .eq("id", id);
            
            if(error)
                throw new Error(error.message);

            return data;    
        } catch(error){
            console.error("error", error);
            throw error;
        }
    }
};