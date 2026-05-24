import type { Post_Images } from "../schemas";
import { supabase } from "../supabase";
import { StorageService } from "./StorageService";

export const PostImageService = {
    async getPostImages(post_id: string){
        try{
            const { data, error } = await supabase
                .from("post_images")
                .select("*")
                .eq("post_id", post_id);

            if(error)
                throw new Error(error.message);

            return data;
        } catch(error){
            console.error(error);
            throw error;
        }
    },

    async addPostImages(post_id: string, images: Post_Images[]){    
        try{
            const uploaded: Post_Images[] = [];

            for(const image of images){
                if(!image.image_file)
                    continue;
            
                const photo = await StorageService.uploadPostImage(image.image_file, post_id);
                uploaded.push({ post_id: post_id, image: photo.publicUrl, image_path: photo.path});
            }

            const { error } = await supabase
                .from("post_images")
                .insert(uploaded);

            if(error)
                throw new Error(error.message);
        } catch(error){
            console.error(error);
            throw error;
        }
    }
};