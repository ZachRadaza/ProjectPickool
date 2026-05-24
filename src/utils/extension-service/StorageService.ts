import { supabase } from "../supabase";

const BUCKET = "images";

type UploadResult = {
    path: string;
    publicUrl: string;
};

export const StorageService = {

    async uploadProfilePic(file: File, userId: string): Promise<UploadResult> {
        const compressed = await this.compressImage(file, 400);
        const ext = this.getFileExtension(compressed.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `profile_pics/${userId}/${fileName}`;

        return this.uploadImage(compressed, path, false);
    },

    async uploadClubProfilePic(file: File, clubId: string): Promise<UploadResult> {
        const compressed = await this.compressImage(file, 400);
        const ext = this.getFileExtension(compressed.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `clubs/${clubId}/${fileName}`;

        return this.uploadImage(compressed, path, false);
    },

    async uploadClubBanner(file: File, clubId: string): Promise<UploadResult> {
        const compressed = await this.compressImage(file);
        const ext = this.getFileExtension(compressed.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `clubs/${clubId}/${fileName}`;

        return this.uploadImage(compressed, path, false);
    },

    async uploadPostImage(file: File, postId: string): Promise<UploadResult> {
        const compressed = await this.compressImage(file, 600);
        const ext = this.getFileExtension(compressed.name);
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const path = `posts/${postId}/${fileName}`;

        return this.uploadImage(compressed, path, false);
    },

    async uploadImage(file: File, path: string, upsert: boolean): Promise<UploadResult> {
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, {
                upsert,
                contentType: file.type,
            });

        if(error)
            throw new Error(`Failed to upload image: ${error.message}`);

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

        return { path, publicUrl: data.publicUrl };
    },

    async deleteImage(path: string): Promise<void> {
        const { error } = await supabase.storage.from(BUCKET).remove([path]);

        if(error)
            throw new Error(`Failed to delete image: ${error.message}`);
    },

    async deleteFolder(path: string): Promise<void> {
        const { data, error } = await supabase
            .storage
            .from(BUCKET)
            .list(path);

        if(error)
            throw new Error(`Failed to get folder files: ${error.message}`);

        if(!data || data.length === 0)
            return;

        const filePaths = data
            .filter((file) => file.id !== null)
            .map((file) => `${path}/${file.name}`);

        if(filePaths.length === 0)
            return;

        const { error: deleteError } = await supabase
            .storage
            .from(BUCKET)
            .remove(filePaths);

        if(deleteError)
            throw new Error(`Failed to delete folder: ${deleteError.message}`);
    },

    async compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
        const bitmap = await createImageBitmap(file);

        let width = bitmap.width;
        let height = bitmap.height;

        if(width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if(!ctx)
            throw new Error("Could not get canvas context");

        ctx.drawImage(bitmap, 0, 0, width, height);

        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/webp", quality)
        );

        if(!blob) {
            const fallbackBlob = await new Promise<Blob | null>((resolve) =>
                canvas.toBlob(resolve, "image/jpeg", quality)
            );

            if(!fallbackBlob)
                throw new Error("Failed to compress image");

            return new File(
                [fallbackBlob],
                file.name.replace(/\.\w+$/, ".jpg"),
                {
                    type: "image/jpeg",
                }
            );
        }

        return new File(
            [blob],
            file.name.replace(/\.\w+$/, ".webp"),
            {
                type: "image/webp",
            }
        );
    },

    getFileExtension(fileName: string): string {
        const parts = fileName.split(".");
        return parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
    }
}