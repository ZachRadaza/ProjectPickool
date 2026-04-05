import "./CreateClubPopup.css";
import { useEffect, useState, useRef } from "react";
import { ExtensionService } from "../../../utils/ExtensionService";
import { Level, type Clubs, type Users } from "../../../utils/schemas";
import { wait } from "../../../utils/random";
import CloseButton from "../../ui/buttons/CloseButton";
import LevelChooser from "../../ui/LevelChooser";
import { useNavigate } from "react-router-dom";

type CreateClubPopup = {
    user: Users | null;
    isClosed: boolean;
    setIsClosed: (close: boolean) => void;
};

export default function CreateClubPopup({ isClosed, setIsClosed, user }: CreateClubPopup){
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [level, setLevel] = useState<Level>(Level.ALL);
    const [banner, setBanner] = useState<File | null>(null);
    const [profilePic, setProfilePic] = useState<File | null>(null);

    const [isCreating, setIsCreating] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");

    const bannerRef = useRef<HTMLInputElement>(null);
    const profileRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    useEffect(() => {
        setName("");
        setDescription("");
        setLevel(Level.ALL);
        setIsPublic(true);
        setBanner(null);
        setProfilePic(null);
        bannerRef.current!.value = "";
        profileRef.current!.value = "";

        setMessage("");
        setIsCreating(false);
    }, [isClosed]);

    useEffect(() => {
        if(!banner) return;

        const url = URL.createObjectURL(banner);

        return () => URL.revokeObjectURL(url);
    }, [banner]);

    useEffect(() => {
        if(!profilePic) return;

        const url = URL.createObjectURL(profilePic);

        return () => URL.revokeObjectURL(url);
    }, [profilePic]);

    async function createClub(){
        if(!user)
            return;

        setIsCreating(true);

        const newClub: Clubs = {
            name,
            description,
            is_public: isPublic,
            level: level,
            banner_file: banner,
            profile_pic_file: profilePic
        };

        const club = await ExtensionService.addClub(newClub, user.id!);

        if(club){
            wait(2000);

            setIsClosed(true);
            navigate(`?club=${club.id}`);
            window.location.reload();
        } else {
            setMessage("Error has occured");
        }

        setIsCreating(false);
    }

    return (
        <div className="container">
            <div className={ `popup create-club ${isClosed ? "closed" : ""}`}>
                <CloseButton setIsClosed={ setIsClosed } />
                <h3>Create a Club</h3>
                <p className="message">{ message }</p>
                <div className="banner image-edit">
                    <div className="input-cont">
                        <input 
                            type="file"
                            className="image"
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                setBanner(file);
                            }}
                            ref={ bannerRef }
                        />
                    </div>
                    <div className="banner-crop image-edit">
                        <img 
                            src={ banner ? URL.createObjectURL(banner) : import.meta.env.VITE_DEFAULT_CLUB_BANNER }
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
                                    setProfilePic(file);
                                }}
                                ref={ profileRef }
                            />
                        </div>
                        <img 
                            src={ profilePic ? URL.createObjectURL(profilePic) : import.meta.env.VITE_DEFAULT_CLUB_PIC } 
                            alt="Club Profile Picture"
                        />
                    </div>
                    <input 
                        placeholder="Name of Club"
                        className="name"
                        onChange={ (event) => setName(event.target.value) }
                        value={ name }
                    />
                    <textarea
                        className="desc"
                        placeholder="Description of Club"
                        onChange={ (event) => setDescription(event.target.value) }
                        value={ description }
                        rows={ 4 }
                    ></textarea>
                    <div className="is-public">
                        <div className="club-level">
                            <h6>Choose Club Level:</h6>
                            <LevelChooser isPlayer={ false } level={ level } setLevel={ setLevel }/>
                        </div>
                        <div className="club-privary">
                            <h6>Choose Club Privacy</h6>
                            <div className="btns-cont">
                                <button
                                    className={ isPublic ? "active" : "" }
                                    onClick={() => setIsPublic(true) }
                                >
                                    Public
                                </button>
                                <button
                                    className={ !isPublic ? "active" : "" }
                                    onClick={() => setIsPublic(false) }
                                >
                                    Private
                                </button>
                            </div>
                            <p>
                                { isPublic 
                                    ? "Club Posts, Events, and Members will be publically available. No request needed to join club." 
                                    : "Request is needed to join the club. Club Posts, Events, and Members are only shown to members." 
                                }
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={ () => createClub() }
                >
                    { isCreating ? "Creating Club..." : "Create"}
                </button>
            </div>
        </div>
    );
}