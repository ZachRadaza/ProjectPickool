import { useEffect, useRef, useState } from "react";
import type { Locations, UserHeader, Users } from "../../../utils/schemas";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import CloseButton from "../../ui/buttons/CloseButton";
import { ExtensionService } from "../../../utils/ExtensionService";
import "./EditUserPopup.css";
import "../popup.css";
import Button from "../../ui/buttons/Button";
import LocationInput from "../../ui/inputs/LocationInput";

type EditUserPopupProp = {
    userHeader: UserHeader | null;
    setUserHeader: (userHeader: UserHeader | null) => void;
    setIsClosed: (closed: boolean) => void;
};

export default function EditUserPopup({ userHeader, setUserHeader, setIsClosed }: EditUserPopupProp){
    const [user, setUser] = useState<Users | null>(null);
    const [userTemp, setUserTemp] = useState<Users | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const profilePicRef = useRef<HTMLInputElement>(null);

    let content;

    async function saveChanges(){
        if(!user || !userHeader)
            return;

        setIsSaving(true);

        let updatedUser: Partial<Users> = {};
        
        if(user?.username !== userTemp?.username)
            updatedUser.username = userTemp?.username;

        if(user?.description !== userTemp?.description)
            updatedUser.description = userTemp?.description;

        if(
            JSON.stringify(user?.location) !== JSON.stringify(userTemp?.location) &&
            userTemp?.location
        )
            updatedUser.location = userTemp?.location;

        if(user?.phone !== userTemp?.phone)
            updatedUser.phone = userTemp?.phone;

        if(userTemp?.profile_pic_file instanceof File)
            updatedUser.profile_pic_file = userTemp.profile_pic_file;

        console.log(updatedUser);

        const userData = await ExtensionService.updateUser(userHeader.id, updatedUser);

        if(!userData){
            setError("Error in saving changes");
            setIsSaving(false);
            return;
        }

        setIsSaving(false);
        setUserHeader({ id: userData.id!, username: userData.username, profile_pic: userData.profile_pic ?? "" })
        setIsClosed(true);
    }

    useEffect(() => {
        if(!user?.profile_pic_file) 
            return;

        const url = URL.createObjectURL(user.profile_pic_file);

        return () => URL.revokeObjectURL(url);
    }, [user?.profile_pic_file]);

    useEffect(() => {
        getUser();

        async function getUser(){
            try{
                if(!userHeader){
                    setIsLoading(false);
                    return;
                }

                const userData = await ExtensionService.getUser(userHeader.id);

                if(!userData){
                    setError("Error in Getting User");
                    setIsLoading(false);
                }

                setIsLoading(false);
                setUser(userData);
                setUserTemp({...userData});
            } catch(error){
                setIsLoading(false);
                setError("Error in Getting User");
            }
        }
    }, [userHeader]);

    if(isLoading)
        content = <Loading/>;
    else if(error)
        content = <ErrorPage error={ error } />;
    else
        content = <>
            <h4>Edit User</h4>
            <p className="error-message">{ error }</p>
            <div className="profile-header">
                <div className="profile-pic-cont">
                    <div className="input-cont">
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
                        src={ userTemp?.profile_pic ?? (
                            userTemp?.profile_pic_file 
                                ? URL.createObjectURL(userTemp.profile_pic_file)
                                : import.meta.env.VITE_DEFAULT_PROFILE_PIC 
                            )
                        } 
                    />
                </div>
                <div className="username-cont line-input-cont">
                    <h6 className="tag">Username</h6>
                    <input 
                        className="username"
                        value={ userTemp?.username || "" }
                        onChange={ (event) => setUserTemp((prev) => 
                            prev ? ({...prev, username: event.target.value})
                            : prev 
                        )}
                    />
                </div>
            </div>
            <div className="desc-cont line-input-cont">
                <h6 className="tag">Description</h6>
                <textarea
                    className="desc"
                    value={ userTemp?.description || "" }
                    onChange={ (event) => setUserTemp((prev) => 
                        prev ? ({...prev, description: event.target.value})
                        : prev 
                    )}
                    rows={ 5 }
                ></textarea>
            </div>
            <div className="loc-cont line-input-cont">
                <h6 className="tag">Location</h6>
                <LocationInput 
                    additionalClasses="loc"
                    locationName={ userTemp?.location?.name || "" }
                    onSelect={(loc) => setUserTemp((user) => {
                        const location: Locations = {
                            longitude: loc.longitude,
                            latitude: loc.latitude,
                            address: loc.address,
                            name: loc.name
                        }
                        return user ? { ...user, location } : user
                    })}
                />
            </div>
            <Button
                onBtnClick={ () => saveChanges() }
                content={ isSaving ? "Saving Changes..." : "Save Changes" }
            />
        </>;

    return (
        <div className="popup edit-user-popup">
            <CloseButton setIsClosed={ setIsClosed } />
            { content }
        </div>
    );
}