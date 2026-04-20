import { useNavigate } from "react-router-dom";
import type { UserHeader } from "../../../utils/schemas";
import ".//UserHeaderMiniComp.css";

type UserHeaderMiniCompProp = {
    userHeader: UserHeader;
};

export default function UserHeaderMiniComp({ userHeader }: UserHeaderMiniCompProp){
    const navigate = useNavigate();

    function openUserProfile(){
        const params = new URLSearchParams(location.search);
        params.set("previewuser", userHeader?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    return (
        <div 
            className="user-header-mini-cont"
            onClick={ () => openUserProfile() }    
        >
            <img 
                src={ userHeader.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }
                className="profile-pic"
            />
            <h6 className="name">{ userHeader.username }</h6>
        </div>
    );
}