import { useNavigate } from "react-router-dom";
import { NotificationType, type Notifications } from "../../../utils/schemas";
import CountdownTimer from "../CountdownTimer";
import "./NotificationComp.css";
import CloseButton from "../buttons/CloseButton";

type NotificationCompProp = {
    notification: Notifications
    closeNotifClicked: () => void;
    setIsClosed: (close: boolean) => void;
};

export default function NotificationComp({ notification, closeNotifClicked, setIsClosed }: NotificationCompProp){
    const navigate = useNavigate();

    const content = () => {
        switch(notification.notification_type){
            case NotificationType.CLUB_ACCEPTED:
                return `${notification.club?.name} has accepted your request.`;
            case NotificationType.CLUB_ADMIN:
                return `You are now an admin of ${notification.club?.name}.`;
            case NotificationType.CLUB_NEW_EVENT:
                return `${notification.club?.name} has posted a new event.`;
            case NotificationType.CLUB_LEVEL_APPROVED:
                return `${notification.club?.name} has approved your club level.`;
            case NotificationType.CLUB_REQUEST:
                return `${notification.club?.name} has new requests.`;
            case NotificationType.EVENT_ACCEPTED:
                return <span>You have been accepted to join { notification.event?.name }. {
                    notification.event?.price && notification.event.price > 0 
                        ? <span> You have <CountdownTimer lengthLeftSeconds={ notification.event.approve_window } timerStartsAt={ notification.created_at }/> to pay.</span>
                        : <></>
                }</span>;
            case NotificationType.EVENT_HOST:
                return `You are now a host for ${notification.event?.name}.`;
            case NotificationType.EVENT_REMINDER:
                return `${notification.event?.name} starts tommorow at ${new Date(notification.event?.start_time!).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit" 
                })}.`
            case NotificationType.EVENT_REQUEST:
                return `${notification.event?.name} has new requests.`;
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
                <p>{ content() }</p>
            </div>
            <div className="right-side">
                <CloseButton setIsClosed={ () => closeNotifClicked() } additionalClasses="notif-close-btn"/>
            </div>
        </div>
    );
}