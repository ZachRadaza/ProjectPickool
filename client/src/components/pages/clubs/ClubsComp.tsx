import type { Clubs, UserClubs } from "../../../utils/schemas";
import "./ClubsComp.css";
import { useNavigate } from "react-router-dom";

type ClubsCompProp = {
    userClub: UserClubs | null;
    club: Clubs;
    changeFavorite?: (club_id: string, is_favorite: boolean) => Promise<void>;
}

export default function ClubsComp({ userClub, club, changeFavorite }: ClubsCompProp){
    const navigate = useNavigate();

    function openClub(){
        navigate(`?club=${club.id}`);
    }

    return (
        <div 
            className="club-comp-cont"
            onClick={ () => openClub() }
        >
            { userClub
                ? <button 
                        className={`is-favorite ui ${userClub?.is_favorite ? "active" : ""}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            
                            if(changeFavorite) 
                                changeFavorite(club.id!, !userClub.is_favorite)
                        }}
                    >
                        Favorite
                    </button>
                : <></>
            }
            <div className="banner">
                <img src={ club?.banner || import.meta.env.VITE_DEFAULT_CLUB_BANNER } />
            </div>
            <div className="content">
                <img className="profile-pic" src={ club?.profile_pic || import.meta.env.VITE_DEFAULT_CLUB_PIC } />
                <div className="titles">
                    <h5 className="club-name">{ club?.name }</h5>
                    <h6 className="club-role">{ userClub?.role }</h6>
                </div>
                <div className="attributes">
                    <h6>{ club?.is_public ? "Public" : "Private"}</h6>
                    <h6>{ club?.level }</h6>
                </div>
            </div>
        </div>
    );
}