import type { Club_Members, UserHeader } from "../../../utils/schemas";
import { useNavigate, useLocation } from "react-router-dom";
import "./UserHeaderComp.css";
import Button from "../buttons/Button";

type UserHeaderCompProp = {
    userHeader: UserHeader | null;
    clubInfoHeader?: Club_Members | null;
    disableBtns?: boolean;
    approveClicked?: () => void;
    denyClicked?: () => void;
    approveContent?: string | null;
};

export default function UserHeaderComp({ userHeader, clubInfoHeader, disableBtns, approveClicked, denyClicked, approveContent }: UserHeaderCompProp){
    const navigate = useNavigate();
    const location = useLocation();

    function openUserProfile(){
        if(disableBtns)
            return;

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
                    <div className="name-cont">
                        <h6 className="name">{ userHeader?.username }</h6>
                        { clubInfoHeader &&
                            <p className="attribute-tag secondary">{ clubInfoHeader.level }</p>
                        }
                    </div>
                    { clubInfoHeader && <h6 className="role">{ clubInfoHeader.role }</h6> }
                </div>
                <div className="req-btns-cont">
                    { approveClicked &&   
                        <Button
                            onBtnClick={ () => approveClicked() }
                            content={ approveContent ? approveContent : "Approve"}
                            isDisabled={ disableBtns }
                        />
                    }
                    { denyClicked &&
                        <Button
                            onBtnClick={ () => denyClicked() }
                            content="Deny"
                            additionalClasses="red"
                        />
                    }
                </div>
            </div>
        </div>
    );
}