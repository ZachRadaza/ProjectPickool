import "./ModifyClubPopup.css";
import { useEffect, useState, useRef } from "react";
import { ExtensionService } from "../../../utils/ExtensionService";
import { Level, type Clubs, type UserHeader } from "../../../utils/schemas";
import { wait } from "../../../utils/random";
import CloseButton from "../../ui/buttons/CloseButton";
import LevelChooser from "../../ui/choosers/LevelChooser";
import { useNavigate } from "react-router-dom";
import Button from "../../ui/buttons/Button";
import "../popup.css";

type ModifyClubPopup = {
    userHeader: UserHeader | null;
    isClosed: boolean;
    setIsClosed: (close: boolean) => void;
    isEditing: boolean;
    club_id: string | null;
};

export default function ModifyClubPopup({ isClosed, setIsClosed, userHeader, isEditing, club_id }: ModifyClubPopup){
    const [club, setClub] = useState<Clubs>();
    const [clubCopy, setClubCopy] = useState<Clubs | null>(null);

    const [isLoading, setisLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const bannerRef = useRef<HTMLInputElement>(null);
    const profileRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    function setClubLevel(level: Level){
        setClub((club) => club ? {...club, level } : club);
    }

    async function createClub(){
        if(!userHeader || !club)
            return;

        setisLoading(true);

        const createdClub = await ExtensionService.addClub(club, userHeader.id);

        if(createdClub){
            wait(2000);

            setIsClosed(true);
            navigate(`?club=${createdClub.id}`);
            window.location.reload();
        } else
            setMessage("Error has occured");
        
        setisLoading(false);
    }

    async function updateClub(){
        if(!userHeader?.id || !club || !clubCopy)
            return;

        setisLoading(true);

        const updatedClub: Partial<Clubs> = {};

        if(club.name !== clubCopy.name) updatedClub.name = club.name;
        if(club.description !== clubCopy.description) updatedClub.description = club.description;
        if(club.level !== clubCopy.level) updatedClub.level = club.level;
        if(club.is_public !== clubCopy.is_public) updatedClub.is_public = club.is_public;
        if(club.banner_file) updatedClub.banner_file = club.banner_file;
        if(club.banner_path) updatedClub.banner_path = club.banner_path;
        if(club.profile_pic_file) updatedClub.profile_pic_file = club.profile_pic_file;
        if(club.profile_pic_path) updatedClub.profile_pic_path = club.profile_pic_path;

        const data = await ExtensionService.updateClub(club.id!, updatedClub, userHeader.id);

        if(data){
            wait(2000);
            window.location.reload();
        } else 
            setMessage("Error has occured");

        setisLoading(false);
    }

    useEffect(() => {
        if(!isClosed)
            return;

        bannerRef.current!.value = "";
        profileRef.current!.value = "";

        setMessage("");
        setisLoading(false);
    }, [isClosed]);

    useEffect(() => {
        getClub()

        async function getClub(){
            try{
                if(!club_id){
                    const clubNew: Clubs = {
                        name: "",
                        is_public: true,
                        level: Level.ALL,
                        description: "",
                        banner_file: null,
                        profile_pic_file: null
                    };

                    setClub(clubNew);
                    setClubCopy(clubNew);
                    return;
                }

                const clubFetched: Clubs = await ExtensionService.getClub(club_id);

                if(!clubFetched)
                    setMessage("error in fetching club");

                setClub(clubFetched);
                setClubCopy(clubFetched);
            } catch(error){
                setMessage("error in fetching club");
            }
        }
    }, [club_id]);

    useEffect(() => {
        if(!club?.banner_file) return;

        const url = URL.createObjectURL(club.banner_file);

        return () => URL.revokeObjectURL(url);
    }, [club?.banner_file]);

    useEffect(() => {
        if(!club?.profile_pic_file) return;

        const url = URL.createObjectURL(club.profile_pic_file);

        return () => URL.revokeObjectURL(url);
    }, [club?.profile_pic_file]);

    return (
        <div className="container">
            <div className={ `popup modify-club ${isClosed ? "closed" : ""}`}>
                <CloseButton setIsClosed={ setIsClosed } />
                <h3>{ isEditing ? "Edit Club" : "Create a Club" }</h3>
                <p className="message">{ message }</p>
                <div className="banner image-edit">
                    <div className="input-cont">
                        <input 
                            type="file"
                            className="image"
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                setClub((club) => club ? {...club, banner_file: file} : club);
                            }}
                            ref={ bannerRef }
                        />
                    </div>
                    <div className="banner-crop image-edit">
                        <img 
                            src={ club?.banner_file 
                                ? URL.createObjectURL(club.banner_file) 
                                : ( club?.banner 
                                    ? club.banner
                                    : import.meta.env.VITE_DEFAULT_CLUB_BANNER) 
                            }
                            alt="Club Banner"    
                        />
                    </div>
                </div>
                <div className="content">
                    <div className="profile-pic image-edit">
                        <div className="input-cont">
                            <input 
                                type="file"
                                className="image"
                                onChange={ (event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    setClub((club) => club ? {...club, profile_pic_file: file} : club);
                                }}
                                ref={ profileRef }
                            />
                        </div>
                        <img 
                            src={club?.profile_pic_file 
                                ? URL.createObjectURL(club.profile_pic_file) 
                                : ( club?.profile_pic 
                                    ? club.profile_pic
                                    : import.meta.env.VITE_DEFAULT_CLUB_PIC) 
                            }                            
                            alt="Club Profile Picture"
                        />
                    </div>
                    <input 
                        placeholder="Name of Club"
                        className="name"
                        onChange={ (event) => setClub((club) => club ? {...club, name: event.target.value } : club) }
                        value={ club?.name ?? "" }
                    />
                    <div className="inner-box">
                        <textarea
                            className="desc"
                            placeholder="Description of Club"
                            onChange={ (event) => setClub((club) => club ? {...club, description: event.target.value } : club) }
                            value={ club?.description ?? "" }
                            rows={ 4 }
                        ></textarea>
                        <div className="club-level">
                            <h6>Choose Club Level:</h6>
                            <LevelChooser isPlayer={ false } level={ club?.level! } setLevel={ setClubLevel }/>
                        </div>
                        <div className="club-privacy">
                            <h6>Choose Club Privacy:</h6>
                            <div className="btns-cont">
                                <Button
                                    additionalClasses={ club?.is_public ? "active" : "" }
                                    onBtnClick={ () => setClub((club) => club ? {...club, is_public: true } : club) }
                                    content="Public"
                                />
                                <Button
                                    additionalClasses={!club?.is_public ? "active" : "" }
                                    onBtnClick={ () => setClub((club) => club ? {...club, is_public: false } : club) }
                                    content="Private"                
                                />
                            </div>
                        </div>
                        <p className="privacy-desc">
                            { club?.is_public
                                ? "Club Posts, Events, and Members will be publically available. No request needed to join club." 
                                : "Request is needed to join the club. Club Posts, Events, and Members are only shown to members." 
                            }
                        </p>
                        <Button
                            content={ isEditing
                                ? (isLoading ? "Saving Changes..." : "Save Changes")
                                : (isLoading ? "Creating Club..." : "Create")
                            }
                            onBtnClick={ () => isEditing ? updateClub() : createClub() }
                            additionalClasses="create-btn"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}