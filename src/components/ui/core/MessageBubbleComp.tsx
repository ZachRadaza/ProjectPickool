import { useMemo } from "react";
import type { Club_Messages, UserHeader } from "../../../utils/schemas";
import "./MessageBubbleComp.css";
import { timeAgo } from "../../../utils/random";
import { useNavigate } from "react-router-dom";

type MessageBubbleCompProp = {
    userHeader: UserHeader | null;
    clubMessage: Club_Messages;
    nextClubMessageUserId: string | null;
    onReplyBtnClick: (id: string) => void;
    onReplyBubbleClick: (id: string | null) => void;
};

export default function MessageBubbleComp({ userHeader, clubMessage, nextClubMessageUserId, onReplyBtnClick, onReplyBubbleClick }: MessageBubbleCompProp){
    const navigate = useNavigate();

    const isSelf = useMemo<boolean>(() => {
        if(!userHeader)
            return false;
        
        return userHeader.id === clubMessage.user?.id;
    }, [userHeader]);

    const replyingToSelf = useMemo<boolean>(() => {
        if(!userHeader)
            return false;
        
        return userHeader.id === clubMessage.replying_to?.user_id;
    }, [clubMessage]);

    const isNextSame = useMemo<boolean>(() => {
        if(!clubMessage)
            return false;

        return clubMessage.user?.id === nextClubMessageUserId;
    }, [userHeader, nextClubMessageUserId]);

    function openUserProfile(){
        const params = new URLSearchParams(location.search);
        params.set("previewuser", clubMessage.user?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    return (
        <div 
            className={`message-bubble-comp ${isSelf ? "is-self" : "" } ${isNextSame ? "next-is-same" : ""}`}
            id={`message-${clubMessage.id}`}
        >
            <img
                className="profile-pic" src={ clubMessage.user?.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }
                onClick={openUserProfile}
            />
            <div className="message-content-cont">
                <div className="bubbles-cont">
                    { clubMessage.replying_to &&
                        <p 
                            className={`replying-to message ${replyingToSelf ? "is-self" : "replying-else"}`}
                            onClick={ () => onReplyBubbleClick(clubMessage.replying_to?.id ?? null) }    
                        >{ clubMessage.replying_to.message }</p>
                    }
                    <p className="message regular">{ clubMessage.message || " " }</p>
                </div>
                <div className="outside-cont">
                    <p className="date">{ timeAgo(clubMessage.created_at) }</p>
                    <button onClick={ () => onReplyBtnClick(clubMessage.id!) } className="ui reply-btn">Reply</button>
                </div>
            </div>
        </div>
    );
}