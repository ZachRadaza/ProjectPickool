import type { Users } from "../../../utils/schemas";
import { useEffect, useState, useRef } from "react";
import "./UserInfoComp.css";
import { ExtensionService } from "../../../utils/ExtensionService";
import EditButton from "../../ui/buttons/EditButton";

type UserInfoComp = {
    loadedUser: Users | null;
    selfUser: Users | null;
    updateUserInfo: (id: string, user: Partial<Users>) => Promise<void>;
};

export default function UserInfoComp({ loadedUser, selfUser, updateUserInfo }: UserInfoComp){
    const [isSelf, setIsSelf] = useState<boolean>(false);
    const [userTemp, setUserTemp] = useState<Users | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

    const profilePicRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLTextAreaElement | null>(null);

    async function logoutClicked(){
        setIsLoggingOut(true);

        await ExtensionService.logoutUser();

        setIsLoggingOut(false);

        window.location.reload();
    }

    function editingClass(compClass: string){
        return `${isEditing ? "editing" : ""} ${compClass}`;
    }

    function selfClass(compClass: string){
        return `${compClass} ${isSelf ? "self" : ""}`
    }

    function editBtnPressed(){
        if(isEditing){
            setUserTemp({...selfUser!});
            profilePicRef.current!.value = "";
        }

        setIsEditing(!isEditing);
    }
   
    async function saveChanges(){
        if(!selfUser)
            return;

        setIsSaving(true);

        let updatedUser: Partial<Users> = {};
        
        if(selfUser?.username !== userTemp?.username)
            updatedUser.username = userTemp?.username;

        if(selfUser?.description !== userTemp?.description)
            updatedUser.description = userTemp?.description;

        if(
            JSON.stringify(selfUser?.location) !== JSON.stringify(userTemp?.location) &&
            userTemp?.location
        )
            updatedUser.location = userTemp?.location;

        if(selfUser?.phone !== userTemp?.phone)
            updatedUser.phone = userTemp?.phone;

        if(userTemp?.profile_pic_file instanceof File)
            updatedUser.profile_pic_file = userTemp.profile_pic_file;

        await updateUserInfo(selfUser.id!, updatedUser);

        setIsSaving(false);
    }

    useEffect(() => {
        if(!loadedUser)
            return;

        if(selfUser?.id === loadedUser.id)
            setIsSelf(true);

        setUserTemp({...loadedUser});
    }, [loadedUser]);

    useEffect(() => {
        if(descRef.current){
            const el = descRef.current;
            el.style.height = "auto";
            el.style.height = el.scrollHeight + "px";
        }
    }, [userTemp?.description]);

    useEffect(() => {
        if(!selfUser?.profile_pic_file) 
            return;

        const url = URL.createObjectURL(selfUser.profile_pic_file);

        return () => URL.revokeObjectURL(url);
    }, [selfUser?.profile_pic_file]);

    return (
        <div className="user-info-comp">
            { isSelf 
                ? <EditButton action={ editBtnPressed } />
                : <></>
            }
            <div className="content">
                <div className="profile-pic-cont">
                    <div className={ editingClass("input-cont") }>
                        <input 
                            type="file"
                            className="profile-pic-edit"
                            onChange={ (event) => {
                                const file = event.target.files?.[0] ?? null;
                                setUserTemp((prev) => prev 
                                    ? ({...prev, profile_pic_file: file}) 
                                    : prev
                                );
                            }}
                            ref={ profilePicRef }
                        />
                    </div>
                    <img 
                        className="profile-pic" 
                        src={ selfUser?.profile_pic ?? (
                            userTemp?.profile_pic_file 
                                ? URL.createObjectURL(userTemp.profile_pic_file)
                                : import.meta.env.VITE_DEFAULT_PROFILE_PIC 
                            )
                        } 
                    />
                </div>
                <div className="main-content">
                    <input 
                        className={ editingClass("username") }
                        value={ userTemp?.username || "" }
                        onChange={ (event) => setUserTemp((prev) => 
                            prev ? ({...prev, username: event.target.value})
                            : prev 
                        )}
                    />
                    <textarea
                        className={ editingClass("desc") }
                        value={ userTemp?.description || "" }
                        onChange={ (event) => setUserTemp((prev) => 
                            prev ? ({...prev, description: event.target.value})
                            : prev 
                        )}
                        rows={ 1 }
                        ref={ descRef }
                    ></textarea>
                </div>
                <div className="side-content">
                </div>
            </div>
            <div className={ selfClass("btns") }>
                <button
                    onClick={ () => { saveChanges(); setIsEditing(false); }}    
                    className={ editingClass("save-btn") }
                >
                    { isSaving ? "Saving..." : "Save" }
                </button>
                <button
                    onClick={() => logoutClicked()}
                >
                    { !isLoggingOut ? "Log Out" : "Loggin Out" }
                </button>
            </div>
        </div>
    );
}