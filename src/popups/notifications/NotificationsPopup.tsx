import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Notifications, UserHeader } from "../../utils/schemas";
import CloseButton from "../../components/ui/buttons/CloseButton";
import NotificationComp from "../../components/ui/core/NotificationComp";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import { ExtensionService } from "../../utils/ExtensionService";
import "./NotificationsPopup.css";

type NotificationsPopupProp = {
    setIsClosed: Dispatch<SetStateAction<boolean>>;
    userHeader: UserHeader | null;
    setNumNotifs: Dispatch<SetStateAction<number>>;
};

export default function NotificationsPopup({ setIsClosed, userHeader, setNumNotifs }: NotificationsPopupProp){
    const [notifications, setNotifications] = useState<Notifications[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function closeNotifClicked(id: string){
        if(!id)
            return;

        setNumNotifs(notifications.length - 1);
        setNotifications(notifications.filter((notif) => notif.id !== id));

        const removed = await ExtensionService.NotificationService.deleteNotification(id);

        if(!removed){
            setError("Error in removing notification");
            return;
        }

        setNumNotifs(notifications.length - 1);
        setNotifications(notifications.filter((notif) => notif.id !== id));
    }

    useEffect(() => {
        getNotifs();

        async function getNotifs(){
            try{
                if(!userHeader){
                    setIsLoading(false);
                    return;
                }

                const notifs = await ExtensionService.NotificationService.getAllNotifications(userHeader.id);

                setNotifications(notifs);
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Error in loading notifications");
            }
        }
    }, []);

    let content;

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error }/>;
    else content = <>
        <h3>Notifications</h3>
        <div className="notifications">
            { notifications.length > 0
                ? <>{ notifications.map((notifs) => 
                    <NotificationComp 
                        notification={ notifs } 
                        closeNotifClicked={ () => closeNotifClicked(notifs.id ? notifs.id : "") } 
                        setIsClosed={ setIsClosed }
                        key={ notifs.id }
                    />
                )}</>
                : <h6 className="no-notif">No New Notifications</h6>
            }
        </div>
    </>;

    return (
        <div className="popup notif-popup">
            <CloseButton setIsClosed={ setIsClosed } />
            { content }
        </div>
    );
}