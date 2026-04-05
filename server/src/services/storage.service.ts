import crypto from "crypto";
import { supabaseAdmin } from "../lib/supabase.js";

const BUCKET = "images";

export async function uploadProfilePic(file: Express.Multer.File, user_id: string): Promise<{ path:string, publicUrl: string}> {
    const ext = getFileExtension(file.originalname);
    const path = `profile_pics/${user_id}/profile_pic.${ext}`;

    const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, file.buffer, {
            upsert: true,
            contentType: file.mimetype,
        });

    if(error){
        throw new Error(`Failed to upload profile pic: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return {
        path,
        publicUrl: data.publicUrl
    };
}

export async function uploadClubProfilePic(file: Express.Multer.File, club_id: string): Promise<{ path:string, publicUrl: string}> {
    const ext = getFileExtension(file.originalname);
    const path = `clubs/${club_id}/profile_pic.${ext}`;

    const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, file.buffer, {
            upsert: true,
            contentType: file.mimetype,
        });

    if(error){
        throw new Error(`Failed to upload club profile pic: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return {
        path,
        publicUrl: data.publicUrl
    };
}

export async function uploadClubBanner(file: Express.Multer.File, club_id: string): Promise<{ path:string, publicUrl: string}> {
    const ext = getFileExtension(file.originalname);
    const path = `clubs/${club_id}/banner.${ext}`;

    const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, file.buffer, {
            upsert: true,
            contentType: file.mimetype,
        });

    if(error){
        throw new Error(`Failed to upload banner: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return {
        path,
        publicUrl: data.publicUrl
    };
}

export async function uploadPostImage(file: Express.Multer.File, postId: string): Promise<{ path: string; publicUrl: string }> {
    const ext = getFileExtension(file.originalname);
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const path = `posts/${postId}/${fileName}`;

    const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if(error){
        throw new Error(`Failed to upload post image: ${error.message}`);
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

    return {
        path,
        publicUrl: data.publicUrl,
    };
}

export async function deleteImage(path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);

    if(error){
        throw new Error(`Failed to delete image: ${error.message}`);
    }
}

export function getFileExtension(fileName: string): string {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
}