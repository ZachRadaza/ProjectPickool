import { useNavigate } from "react-router-dom";
import type { UserHeader } from "../../../utils/schemas";
import ".//UserHeaderMiniComp.css";
import CloseButton from "../buttons/CloseButton";

type UserHeaderMiniCompProp = {
    userHeader: UserHeader;
    showUnpaid?: boolean;
    crossBtn?: boolean;
    crossBtnClicked?: () => void;
};

export default function UserHeaderMiniComp({ userHeader, showUnpaid, crossBtn, crossBtnClicked }: UserHeaderMiniCompProp){
    const navigate = useNavigate();

    function openUserProfile(){
        if(userHeader.id.includes("guest"))
            return;

        const params = new URLSearchParams(location.search);
        params.set("previewuser", userHeader?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    return (
        <div 
            className="user-header-mini-cont"
            onClick={ () => openUserProfile() }    
        >
            { (crossBtn === true && crossBtnClicked) &&
                <CloseButton setIsClosed={ crossBtnClicked } />
            }
            { showUnpaid === true &&
                <p className="attribute-tag unpaid">Unpaid</p>
            }
            <img 
                src={ userHeader.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }
                className="profile-pic"
            />
            <h6 className="name">{ userHeader.username }</h6>
        </div>
    );
}