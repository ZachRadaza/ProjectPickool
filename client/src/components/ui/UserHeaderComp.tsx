import type { Club_Members, UserHeader } from "../../utils/schemas";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserHeaderComp.css";

type UserHeaderCompProp = {
    userHeader: UserHeader | null;
    clubInfoHeader?: Club_Members | null;
    isRequest?: boolean;
    approveClicked?: () => void;
    denyClicked?: () => void;
};

export default function UserHeaderComp({ userHeader, clubInfoHeader, isRequest, approveClicked, denyClicked }: UserHeaderCompProp){
    const navigate = useNavigate();
    const location = useLocation();

    function openUserProfile(){
        const params = new URLSearchParams(location.search);
        params.set("previewuser", userHeader?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
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
            <div className="user-body">
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
                { isRequest
                    ? <div className="req-btns-cont">
                        <button
                            onClick={ (e) => { 
                                e.stopPropagation();
                                if(approveClicked) approveClicked(); 
                            }}
                        >
                            Approve
                        </button>
                        <button
                            onClick={ (e) => { 
                                e.stopPropagation();
                                if(denyClicked) denyClicked(); 
                            }}
                        >
                            Deny
                        </button>
                    </div>
                    : <></>
                }
            </div>
        </div>
    );
}