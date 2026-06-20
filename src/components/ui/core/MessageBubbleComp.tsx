import { useMemo } from "react";
import type { Club_Messages, UserHeader } from "../../../utils/schemas";
import "./MessageBubbleComp.css";
import { timeAgo } from "../../../utils/random";
import { useNavigate } from "react-router-dom";

type MessageBubbleCompProp = {
    userHeader: UserHeader | null;
    clubMessage: Club_Messages;
};

export default function MessageBubbleComp({ userHeader, clubMessage }: MessageBubbleCompProp){
    const navigate = useNavigate();

    const isSelf = useMemo<boolean>(() => {
        if(!userHeader)
            return false;
        
        return userHeader.id === clubMessage.user?.id;
    }, [userHeader]);

    function openUserProfile(){
        const params = new URLSearchParams(location.search);
        params.set("previewuser", clubMessage.user?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    return (
        <div className={`message-bubble-comp ${ isSelf ? "is-self" : "" }`}>
            <img 
                className="profile-pic" src={ clubMessage.user?.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }
                onClick={openUserProfile}
            />
            <div className="message-content-cont">
                <p className="message">{ clubMessage.message || " " }</p>
                <p className="date">{ timeAgo(clubMessage.created_at) }</p>
            </div>
        </div>
    );
}