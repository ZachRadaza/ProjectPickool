import { capitalizeWords } from "../../../utils/random";
import { type Clubs, type UserClubRequests, type UserClubs } from "../../../utils/schemas";
import FavoriteButton from "../buttons/FavoriteButton";
import "./ClubsComp.css";
import { useNavigate } from "react-router-dom";

type ClubsCompProp = {
    userClub: UserClubs | null;
    userRequest?: UserClubRequests | null;
    club: Clubs;
    changeFavorite?: (club_id: string, is_favorite: boolean) => Promise<void>;
    showFavorite?: boolean;
}

export default function ClubsComp({ userClub, club, changeFavorite, userRequest, showFavorite }: ClubsCompProp){
    const navigate = useNavigate();

    function openClub(){
        navigate(`?club=${club.id}`);
    }

    return (
        <div 
            className={ `club-comp-cont ${userRequest ? "waiting" : ""}` }
            onClick={ () => openClub() }
        >
            <svg className="club-icon" xmlns="http://www.w3.org/2000/svg" viewBox="-5 -10 110 135">
                <path d="M23.043 30.801c4.379 0 7.926 3.547 7.926 7.926s-3.547 7.926-7.926 7.926-7.926-3.547-7.926-7.926 3.547-7.926 7.926-7.926zm26.957 16.957c12.188 0 22.16 9.973 22.16 22.16v1.609c0 1.773-1.445 3.223-3.223 3.223H31.063c-1.773 0-3.223-1.445-3.223-3.223v-1.609c0-12.188 9.973-22.16 22.16-22.16zm0-22.504c5.734 0 10.383 4.649 10.383 10.383S55.734 46.02 50 46.02s-10.383-4.649-10.383-10.383S44.266 25.254 50 25.254zm26.957 5.547c4.379 0 7.926 3.547 7.926 7.926s-3.547 7.926-7.926 7.926-7.926-3.547-7.926-7.926 3.547-7.926 7.926-7.926zm-53.914 17.215c-9.305 0-16.922 7.613-16.922 16.922v1.231c0 1.355 1.105 2.461 2.461 2.461h17.465c.352-6.551 3.359-12.422 7.961-16.551-2.957-2.527-6.789-4.059-10.965-4.059zm53.914 0c-4.172 0-8.004 1.532-10.965 4.059 4.602 4.129 7.609 10 7.961 16.551h17.465c1.355 0 2.461-1.105 2.461-2.461v-1.231c0-9.305-7.613-16.922-16.922-16.922z" fillRule="evenodd"/>
            </svg>
            { (userClub && showFavorite) &&
                <FavoriteButton
                    onBtnClick={ ()  => {                        
                        if(changeFavorite) 
                            changeFavorite(club.id!, !userClub.is_favorite)
                    }}
                    isFavorite={ userClub.is_favorite }
                />
            }
            <div className="banner">
                <img src={ club?.banner || import.meta.env.VITE_DEFAULT_CLUB_BANNER } />
            </div>
            <div className="content">
                <div className="headers">
                    <img className="profile-pic" src={ club?.profile_pic || import.meta.env.VITE_DEFAULT_CLUB_PIC } />
                    <div className="titles">
                        <h5 className="club-name">{ club?.name }</h5>
                        <h6 className="club-role">{ userClub?.role }</h6>
                        { userRequest && <p className="attribute-tag accent">Requested</p> }
                    </div>
                </div>
                <div className="attributes">
                    <p className="attribute-tag secondary">{ club?.is_public ? "Public" : "Private"}</p>
                    { club.level && <p className="attribute-tag secondary">{ capitalizeWords(club?.level) }</p> }
                </div>
            </div>
        </div>
    );
}