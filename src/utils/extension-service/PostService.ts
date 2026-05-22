import type { Posts } from "../schemas";
import { supabase } from "../supabase";
import { PostImageService } from "./PostImageService";

const postBody = `
    id,
    club:clubs(
        id,
        name,
        profile_pic
    ),
    user:users!posts_user_id_fkey(
        id,
        username,
        profile_pic
    ),
    title,
    description,
    created_at
`;

export const PostService = {
    async getClubPosts(club_id: string, user_id: string | null, page: number){
        try{
            const pageSize = 10;

            const { data, error } = await supabase.rpc("get_club_posts_with_likes", {
                p_club_id: club_id,
                p_user_id: user_id,
                p_page: page,
                p_page_size: pageSize + 1,
            });

            if(error) 
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const converted = this.convertListOfPosts(trimmedData);

            return { data: converted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getUserPosts(profile_id: string, user_id: string | null, page: number){
        try{
            const pageSize = 10;

            const { data, error } = await supabase.rpc("get_user_posts_with_likes", {
                p_profile_user_id: profile_id,
                p_user_id: user_id,
                p_page: page,
                p_page_size: pageSize + 1,
            });

            if(error) 
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const converted = this.convertListOfPosts(trimmedData);

            return { data: converted, hasMore };
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async getPost(id: string, user_id: string | null){
        try{
            const { data, error } = await supabase.rpc("get_post_with_likes", {
                p_post_id: id,
                p_user_id: user_id,
            });

            if(error)
                throw new Error(error.message);

            return this.convertToPost(data[0]);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async addPost(user_id: string, post: Posts){
        try{
            const { images, ...postToAdd } = post;
            const { data, error } = await supabase
                .from("posts")
                .insert([postToAdd])
                .select("id")
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            if(post.images)
                await PostImageService.addPostImages(data?.id, post.images);

            return await this.getPost(data?.id, user_id);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async updatePost(id: string, user_id: string, updates: Partial<Posts>){
        try{
            const { error } = await supabase
                .from("posts")
                .update(updates)
                .eq("id", id)
                .select("id")
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return await this.getPost(id, user_id);
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    async deletePost(id: string){
        try{
            const imageData = await PostImageService.getPostImages(id);

            const { data, error } = await supabase
                .from("posts")
                .delete()
                .eq("id", id)
                .select(postBody)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            await PostImageService.deletePostImages(imageData);

            return data;
        } catch(error){
            console.error("error", error);
            throw error;
        }
    },

    convertToPost(data: any){
        if(data === null)
            return null;

        const post: Posts = {
            id: data.id,
            club: data.club,
            user: data.user,
            title: data.title,
            description: data.description,
            images: data.images,
            comment_count: data.comment_count,
            like_count: data.like_count,
            liked_by_user: data.liked_by_user,
            hasMoreComments: true,
            commentPage: 1,
        };
        return post;
    },

    convertListOfPosts(data: any[]){
        const converted = data.map((post) => this.convertToPost(post));
        const filtered = converted.filter((post) => post !== null);

        return filtered;
    },
};