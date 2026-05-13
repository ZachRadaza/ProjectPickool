import { supabaseAdmin } from "../supabase";

const BUCKET = "images";

type UploadResult = {
    path: string;
    publicUrl: string;
};

export const StorageService = {

    async uploadProfilePic(file: File, userId: string): Promise<UploadResult> {
        const ext = this.getFileExtension(file.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `profile_pics/${userId}/${fileName}`;

        return this.uploadImage(file, path, false);
    },

    async uploadClubProfilePic(file: File, clubId: string): Promise<UploadResult> {
        const ext = this.getFileExtension(file.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `clubs/${clubId}/${fileName}`;

        return this.uploadImage(file, path, false);
    },

    async uploadClubBanner(file: File, clubId: string): Promise<UploadResult> {
        const ext = this.getFileExtension(file.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `clubs/${clubId}/${fileName}`;

        return this.uploadImage(file, path, false);
    },

    async uploadPostImage(file: File, postId: string): Promise<UploadResult> {
        const ext = this.getFileExtension(file.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `posts/${postId}/${fileName}`;

        return this.uploadImage(file, path, false);
    },

    async uploadImage(file: File, path: string, upsert: boolean): Promise<UploadResult> {
        const { error } = await supabaseAdmin.storage
            .from(BUCKET)
            .upload(path, file, {
                upsert,
                contentType: file.type,
            });

        if(error)
            throw new Error(`Failed to upload image: ${error.message}`);

        const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

        return { path, publicUrl: data.publicUrl };
    },

    async deleteImage(path: string): Promise<void> {
        console.log(path);
        const { error } = await supabaseAdmin.storage.from(BUCKET).remove([path]);

        if(error)
            throw new Error(`Failed to delete image: ${error.message}`);
    },

    getFileExtension(fileName: string): string {
        const parts = fileName.split(".");
        return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
    }
}