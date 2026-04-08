import type { Request, Response } from "express";
import * as clubsService from "../services/clubs.services.js";
import * as storageService from "../services/storage.service.js";
import * as locationService from "../services/location.service.js";
import * as clubMembersService from "../services/club_members.service.js";
import type { Clubs } from "../lib/schemas.js";

export async function getAllClubs(req: Request, res: Response){
    try{
        const data = await clubsService.getAllClubs();

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("getAllClubs error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function getClub(req: Request, res: Response){
    try{
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: "id required"
            });

        const data = await clubsService.getClub(id);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("getClub error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function addClub(req: Request, res: Response){
    try{
        const { 
            name,
            description,
            is_public,
            location,
            owner_id,
            level
         } = req.body;

        const files = req.files as {
            profile_pic_file?: Express.Multer.File[];
            banner_file?: Express.Multer.File[];
        };
        const profile_pic_file = files.profile_pic_file?.[0];
        const banner_file = files.banner_file?.[0];

        if(!name || typeof name !== "string")
            return res.status(400).json({
                success: false,
                error: "club is required"
            });

        const is_public_bool = is_public === "true" ? true : false;
        let club: Clubs = { name, level, is_public: is_public_bool };

        if(location && !location.id){
            const locationId = await locationService.locationExists(location);
            club.location_id = locationId;
        }

        if(description) club.description = description;

        const clubRaw = await clubsService.addClub(club);

        const id = clubRaw.id;
        let profile_pic;
        let profile_pic_path;
        let banner;
        let banner_path;

        await clubMembersService.addClubMember(id, owner_id, true);

        if(profile_pic_file){
            const upload = await storageService.uploadClubProfilePic(profile_pic_file, id);
            profile_pic_path = upload.path;
            profile_pic = upload.publicUrl;
        }

        if(banner_file){
            const upload = await storageService.uploadClubBanner(banner_file, id);
            banner_path = upload.path;
            banner = upload.publicUrl;       
        }

        const updatedClub: Clubs = { ...clubRaw, banner_path, banner, profile_pic, profile_pic_path };

        const data = await clubsService.updateClub(id, updatedClub);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("addClub error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function updateClub(req: Request, res: Response){
    try{
        const { id } = req.params;
        const { 
            name,
            description,
            is_public,
            location,
            level,
            profile_pic_path,
            banner_path,
            user_id
         } = req.body;

        const files = req.files as {
            profile_pic_file?: Express.Multer.File[];
            banner_file?: Express.Multer.File[];
        };
        const profile_pic_file = files.profile_pic_file?.[0];
        const banner_file = files.banner_file?.[0];

        if(!id || 
            typeof id !== "string" ||
            !user_id ||
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "id required"
            });

        const editable = await clubMembersService.getSingleClubMember(id, user_id);

        if(!editable || editable.role === "member")
            return res.status(400).json({
                success: false,
                error: "no credentials to edit club"
            });

        let profilePic;
        let profilePicPath;
        let banner;
        let bannerPath;

        if(profile_pic_file){
            const upload = await storageService.uploadClubProfilePic(profile_pic_file, id);
            profilePicPath = upload.path;
            profilePic = upload.publicUrl;
            storageService.deleteImage(profile_pic_path);
        }

        if(banner_file){
            const upload = await storageService.uploadClubBanner(banner_file, id);
            bannerPath = upload.path;
            banner = upload.publicUrl;       
            storageService.deleteImage(banner_path);
        }

        const is_public_bool = is_public === "true" ? true : false;
        const club: Partial<Omit<Clubs, "id">> = { is_public: is_public_bool };

        if(name) club.name = name;
        if(description) club.description = description;
        if(level) club.level = level;
        if(profilePic) club.profile_pic = profilePic;
        if(profilePicPath) club.profile_pic_path = profilePicPath;
        if(banner) club.banner = banner;
        if(bannerPath) club.banner_path = bannerPath;

        if(location && !location.id){
            const locationId = await locationService.locationExists(location);
            club.location_id = locationId;
        }

        const data = await clubsService.updateClub(id, club);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("updateClub error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}

export async function deleteClub(req: Request, res: Response){
    try{
        const { id } = req.params;
        const { user_id } = req.body;

        if(!id || 
            typeof id !== "string" ||
            !user_id ||
            typeof user_id !== "string"
        )
            return res.status(400).json({
                success: false,
                error: "id required"
            });

        const deletable = await clubMembersService.getSingleClubMember(id, user_id);

        if(!deletable || deletable.role === "member")
            return res.status(400).json({
                success: false,
                error: "no credentials to delete club"
            });

        const data = await clubsService.deleteClub(id);

        if(data.profile_pic_path) storageService.deleteImage(data.profile_pic_path);
        if(data.banner_path) storageService.deleteImage(data.banner_file);

        if(data.profile_pic_path || data.banner_path)
            storageService.deleteDirectoryFromFilePath(data.profile_pic_path ?? data.banner_path);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error){
        console.error("deleteClub error", error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
}