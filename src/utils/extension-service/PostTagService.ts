import type { Post_Tags } from "../schemas";
import { supabase } from "../supabase";

export const PostTagService = {
    async getPostTags(post_id: string){
        try{
            const { data, error } = await supabase
                .from("post_tags")
                .select("*")
                .eq("post_id", post_id);

            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addPostTags(postTags: Post_Tags[]){
        try{
            const { data, error } = await supabase
                .from("post_tags")
                .insert(postTags)
                .select("*")

            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deletePostTag(post_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("post_tags")
                .delete()
                .eq("post_id", post_id)
                .eq("user_id", user_id);

            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    }
};