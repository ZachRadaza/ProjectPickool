import type { Comments } from "../schemas";
import { supabase } from "../supabase";

const commentBody = `
    id,
    post_id,
    user:users(
        id,
        username,
        profile_pic
    ),
    parent_comment_id,
    comment,
    created_at
`;

export const CommentService = {
    async getPostParentComments(post_id: string, page: number){
        try{
            const pageSize = 10;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from("comments")
                .select(commentBody)
                .eq("post_id", post_id)
                .eq("parent_comment_id", null)
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const comments: Comments[] = this.convertListOfComment(trimmedData);

            return { data: comments, hasMore };
        } catch(error){
            console.error(error);
            throw error;
        }
    }, 

    async getCommentThread(parent_comment_id: string, page: number){
        try{
            const pageSize = 10;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data, error } = await supabase
                .from("comments")
                .select(commentBody)
                .eq("parent_comment_id", parent_comment_id)
                .order("created_at", { ascending: false })
                .range(from, to + 1);

            if(error)
                throw new Error(error.message);

            const hasMore = data.length > pageSize;
            const trimmedData = data.slice(0, pageSize);
            const comments: Comments[] = this.convertListOfComment(trimmedData);

            return { data: comments, hasMore }; 
        } catch(error){
            console.error(error);
            throw error;
        }
    }, 

    async addComment(comment: Comments){
        try{
            const { data, error } = await supabase
                .from("comments")
                .insert([comment])
                .select(commentBody)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToComment(data);
        } catch(error){
            console.error(error);
            throw error;
        }
    }, 

    async deleteComment(id: string){
        try{
            const { data, error } = await supabase
                .from("comment")
                .delete()
                .eq("id", id)
                .maybeSingle();

            if(error)
                throw new Error(error.message);

            return this.convertToComment(data);
        } catch(error){
            console.error(error);
            throw error;
        }
    },

    convertToComment(data: any){
        if(data === null)
            return null;

        const comment: Comments = {
            id: data.id,
            post_id: data.post_id,
            user: data.user,
            parent_comment_id: data.parent_comment_id,
            created_at: data.created_at,
            comment: data.comment
        };

        return comment
    },

    convertListOfComment(data: any[]){
        const converted = data.map((comment) => this.convertToComment(comment));
        const filtered = converted.filter((comment) => comment !== null);

        return filtered;
    }
};