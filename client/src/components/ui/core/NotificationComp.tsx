import { useNavigate } from "react-router-dom";
import { NotificationType, type Notifications } from "../../../utils/schemas";
import CountdownTimer from "../CountdownTimer";
import "./NotificationComp.css";
import CloseButton from "../buttons/CloseButton";

type NotificationCompProp = {
    notification: Notifications
    closeNotifClicked: () => void;
    setIsClosed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function NotificationComp({ notification, closeNotifClicked, setIsClosed }: NotificationCompProp){
    const navigate = useNavigate();

    const content = () => {
        switch(notification.notification_type){
            case NotificationType.CLUB_ACCEPTED:
                return <span><span className="heading-font">{ notification.club?.name }</span> has accepted your request.</span>;
            case NotificationType.CLUB_ADMIN:
                return <span>You are now an admin of <span className="heading-cont">{notification.club?.name}</span>.</span>;
            case NotificationType.CLUB_NEW_EVENT:
                return <span><span className="heading-font">{notification.club?.name}</span> has posted a new event.</span>;
            case NotificationType.CLUB_LEVEL_APPROVED:
                return <span><span className="heading-font">{notification.club?.name}</span> has approved your club level.</span>;
            case NotificationType.CLUB_REQUEST:
                return <span><span className="heading-font">{notification.club?.name}</span> has new requests.</span>;
            case NotificationType.EVENT_ACCEPTED:
                return <span>You have been accepted to join <span className="heading-font">{ notification.event?.name }</span>. {
                    notification.event?.price && notification.event.price > 0 
                        ? <span> You have <CountdownTimer lengthLeftSeconds={ notification.event.approve_window } timerStartsAt={ notification.created_at }/> to pay.</span>
                        : <></>
                }</span>;
            case NotificationType.EVENT_HOST:
                return <span>You are now a host for <span className="heading-font">{notification.event?.name}.</span></span>;
            case NotificationType.EVENT_REMINDER:
                return <span><span className="heading-font">{ notification.event?.name }</span> starts tommorow at { new Date(notification.event?.start_time!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit" 
                })}.</span>
            case NotificationType.EVENT_REQUEST:
                return <span><span className="heading-font">{notification.event?.name}</span> has new requests.</span>;
        }
    }

    async function notifClicked(){
        switch(notification.notification_type){
            case NotificationType.CLUB_ACCEPTED:
            case NotificationType.CLUB_ADMIN:
            case NotificationType.CLUB_LEVEL_APPROVED:
            case NotificationType.CLUB_REQUEST:
                if(!notification.club?.id)
                    return;

                navigate(`?club=${notification.club.id}`);
                break;
            case NotificationType.CLUB_NEW_EVENT:
            case NotificationType.EVENT_ACCEPTED:
            case NotificationType.EVENT_HOST:
            case NotificationType.EVENT_REMINDER:
            case NotificationType.EVENT_REQUEST:
                if(!notification.event?.id)
                    return;

                const params = new URLSearchParams(location.search);
                params.set("event", notification.event?.id ?? "");
                navigate(`${location.pathname}?${params.toString()}`);
                break;
        }

        setIsClosed(true);
        closeNotifClicked();
    }

    return (
        <div className="notif-comp" onClick={ () => notifClicked() }>
            <div className="left-side">
                <img
                    src={ notification.club?.profile_pic || import.meta.env.VITE_DEFAULT_CLUB_PIC }
                />
                <div className="notif-content">
                    <p>{ content() }</p>
                    <p className="date">{ new Date(notification.created_at).toLocaleDateString() }</p>
                </div>
            </div>
            <div className="right-side">
                <CloseButton setIsClosed={ () => closeNotifClicked() } additionalClasses="notif-close-btn"/>
            </div>
        </div>
    );
}