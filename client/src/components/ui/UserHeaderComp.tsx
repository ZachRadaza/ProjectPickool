import type { Club_Members, UserHeader } from "../../utils/schemas";
import { useNavigate } from "react-router-dom";
import "./UserHeaderComp.css";

type UserHeaderCompProp = {
    userHeader: UserHeader | null;
    clubInfoHeader: Club_Members;
};

export default function UserHeaderComp({ userHeader, clubInfoHeader }: UserHeaderCompProp){
    const navigate = useNavigate();

    function openUserProfile(){
        navigate(`/user/${userHeader?.id}`);
    }

    return (
        <div 
            className="user-header-cont"
            onClick={ () => openUserProfile() }
        >
            <img 
                src={ userHeader?.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }
                className="user-profile-pic"
            />
            <div className="user-content">
                <h6 className="name">{ userHeader?.username }</h6>
                { clubInfoHeader
                    ? (
                        <div className="club-content">
                            <p className="role">{ clubInfoHeader.role }</p>
                            <p className="level">{ clubInfoHeader.level }</p>
                        </div> 
                    ) : <></>
                }
            </div>
        </div>
    );
}