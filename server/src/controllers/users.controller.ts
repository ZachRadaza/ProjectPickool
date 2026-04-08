import * as userService from "../services/users.service.js";
import * as locationService from "../services/location.service.js";
import * as storageService from "../services/storage.service.js";
import * as clubMembersService from "../services/club_members.service.js";
import type { Request, Response} from "express";
import type { Club_Members, Users } from "../lib/schemas.js";

export async function getAllUser(req: Request, res: Response){
    try{
        const users = await userService.getAllUser();

        res.status(200).json({
            success: true,
            data: users
        });
    } catch(error: any){
        console.error("getAllUser Error");
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
}

export async function getUser(req: Request, res: Response){
    try{
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: 'user id required'
            });

        const user = await userService.getUser(id);

        res.status(200).json({
            success: true,
            data: user
        });

    } catch(error: any){
        console.error("getUser Error", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
}

export async function getUserHeader(req: Request, res: Response){
    try{
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: 'user id required'
            });

        const user = await userService.getUserHeader(id);

        res.status(200).json({
            success: true,
            data: user
        });

    } catch(error: any){
        console.error("getUserHeader Error", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
}

export async function getUserClubs(req: Request, res: Response){
    try{
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: 'user id required'
            });

        const clubs = await userService.getUserClubs(id);

        res.setMaxListeners(200).json({
            success: true,
            data: clubs
        });
    } catch(error: any){
        console.error("getUserClubs Error");
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
}

export async function addUser(req: Request, res: Response){
    try{
        const { user } = req.body;

        if(!user || !validateUserBody(user)){
            return res.status(400).json({
                success: false,
                error: 'user content required'
            });
        }

        const location = user.location;
        let userUpdatedLoc = user;

        if(location && !user.location.id){
            const locationId = await locationService.locationExists(location);
            userUpdatedLoc = { ...user,  location_id: locationId };
        }

        const addedUser = await userService.addUser(user);

        res.status(200).json({
            success: true,
            data: addedUser
        });
    } catch(error: any){
        console.error("addUser Error", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
}

export async function updateUser(req: Request, res: Response){
    try{
        const {
            description,
            location,
            phone,
            username,
            profile_pic_path
        } = req.body;
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: 'user id required'
            });

        const file = req.file;
        let profilePicUrl;
        let profilePicPath;
        if(file){
            const upload = await storageService.uploadProfilePic(file, id);

            profilePicUrl = upload.publicUrl;
            profilePicPath = upload.path;

            storageService.deleteImage(profile_pic_path);
        }
        
        const updatedUser: Partial<Users> = {};

        if(description) updatedUser.description = description;
        if(phone) updatedUser.phone = phone;
        if(username) updatedUser.username = username;
        if(profilePicUrl) updatedUser.profile_pic = profilePicUrl;
        if(profilePicPath) updatedUser.profile_pic_path = profilePicPath;

        if(location && !location.id){
            const locationId = await locationService.locationExists(location);
            updatedUser.location_id = locationId;
        }

        const data = await userService.updateUser(id, updatedUser);

        res.status(200).json({
            success: true,
            data: data
        });
    } catch(error: any){
        console.error("updateUser Error", error.message);
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
}

export async function deleteUser(req: Request, res: Response){
    try{
        const { id } = req.params;

        if(!id || typeof id !== "string")
            return res.status(400).json({
                success: false,
                error: 'user id required'
            });

        const deleted = await userService.deleteUser(id)

        if(deleted.profile_pic_path){
            storageService.deleteImage(deleted.profile_pic_path);
            storageService.deleteDirectoryFromFilePath(deleted.profile_pic_path);
        }

        res.status(200).json({
            success: true,
            data: deleted
        });
    } catch(error: any){
        console.error("deleteUser Error");
        res.status(500).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
}

function validateUserBody(user: any){
    return (user.username && user.email);
}