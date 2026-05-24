import type { Likes, LikeType } from "../schemas";
import { supabase } from "../supabase";

const likeBody = `
    post_id,
    user:users(
        id,
        username,
        profile_pic
    ),
    type,
    created_at
`;

export const LikeService = {
    async getPostLikes(post_id: string, page: number){
        try{
            const pageSize = 10;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from("likes")
                .select(likeBody)
                .eq("post_id", post_id)
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const likes = this.convertListOfLikes(trimmedData);

            return { data: likes, hasMore };
        } catch(error){
            console.error(error);
            throw error;
        }
    },

    async addPostLike(post_id: string, user_id: string, type: LikeType){
        try{
            const { data, error } = await supabase
                .from("likes")
                .insert([{ post_id, user_id, type }])
                .select(likeBody)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToLike(data);
        } catch(error){
            console.error(error);
            throw error;
        }
    }, 

    async updatePostLike(post_id: string, user_id: string, updatedType: LikeType){
        try{
            const { data, error } = await supabase
                .from("likes")
                .update({ type: updatedType })
                .eq("post_id", post_id)
                .eq("user_id", user_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToLike(data);
        } catch(error){
            console.error(error);
            throw error;
        }
    },

    async deletePostLike(post_id: string, user_id: string){
        try{
            const { data, error } = await supabase
                .from("likes")
                .delete()
                .eq("post_id", post_id)
                .eq("user_id", user_id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToLike(data);
        } catch(error){
            console.error(error);
            throw error;
        }
    }, 

    convertToLike(data: any){
        if(data === null)
            return null;
    
        const like: Likes = {
            post_id: data.post_id,
            user: data.user,
            type: data.type,
            created_at: data.created_at
        };

        return like;
    },

    convertListOfLikes(data: any[]){
        const converted = data.map((like) => this.convertToLike(like));
        const filtered = converted.filter((like) => like !== null);

        return filtered;
    }
};