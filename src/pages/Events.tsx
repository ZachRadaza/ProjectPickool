import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import CalendarComp from "../components/events/CalendarComp";
import type { Events, UserHeader } from "../utils/schemas";
import Loading from "./Loading";
import ErrorPage from "./Error";
import { useOutletContext } from "react-router-dom";
import { ExtensionService } from "../utils/ExtensionService";
import "./Events.css";
import Button from "../components/ui/buttons/Button";
import PopupWrapper from "../popups/PopupWrapper";
import ClubSearchPopup from "../popups/clubs/ClubSearchPopup";

type EventContext = {
    userHeader: UserHeader | null;
    setClosedModifyEvent: Dispatch<SetStateAction<boolean>>;
}

export default function Events(){
    const { userHeader, setClosedModifyEvent } = useOutletContext<EventContext>();

    const [events, setEvents] = useState<Events[]>([]);
    const [currentEventPage, setCurrentEventPage] = useState<number>(1);
    const [hasMoreEvents, setHasMoreEvents] = useState<boolean>(true);
    const [buttonLoading, setButtonLoading] = useState<boolean>(false);
    const [closedClubSearch, setClosedClubSearch] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function getEvents(firstLoad: boolean){
        try{
            if(firstLoad)
                setIsLoading(true)
            else { 
                setIsLoading(false);
                setButtonLoading(true);
            }

            let res;
            if(!userHeader)
                res = await ExtensionService.EventService.getTopEvents(currentEventPage);
            else 
                res = await ExtensionService.EventService.getPossibleUserEvents(userHeader.id, currentEventPage);

            setEvents([...events, ...res.data]);
            setIsLoading(false);
            setButtonLoading(false);
            setCurrentEventPage(currentEventPage + 1);
            setHasMoreEvents(res.hasMore);
        } catch(error){
            setError("Error in getting events");
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getEvents(true);
    }, []);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error } />;

    return (
        <>
            <div className="events-cont">
                <h1 className="title">Events</h1>
                <CalendarComp 
                    events={ events } 
                    showClub={ true } 
                    userHeader={ userHeader } 
                    setClosedModifyEvent={ setClosedModifyEvent } 
                    openClubSearchOnClick={ true }
                    setClosedClubSearch={ setClosedClubSearch }
                />
                { hasMoreEvents &&
                    <Button 
                        content={ buttonLoading ? "Loading More..." : "Load More"}
                        onBtnClick={ () => getEvents(false) }
                    />
                }
            </div>
            <PopupWrapper 
                popupComp={
                    <ClubSearchPopup 
                        userHeader={ userHeader }
                        setIsClosed={ setClosedClubSearch }
                        setClosedModifyEvent={ setClosedModifyEvent }
                        creatingEvent={ true }
                    />
                }
                isClosed={ closedClubSearch }
            />
        </>
    );
}