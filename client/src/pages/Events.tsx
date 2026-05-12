import { useEffect, useState } from "react";
import CalendarComp from "../components/pages/events/CalendarComp";
import type { Events, UserHeader } from "../utils/schemas";
import Loading from "./Loading";
import ErrorPage from "./Error";
import { useOutletContext } from "react-router-dom";
import { ExtensionService } from "../utils/ExtensionService";
import "./Events.css";
import Button from "../components/ui/buttons/Button";

type EventContext = {
    userHeader: UserHeader | null;
}

export default function Events(){
    const { userHeader } = useOutletContext<EventContext>();

    const [events, setEvents] = useState<Events[]>([]);
    const [currentEventPage, setCurrentEventPage] = useState<number>(1);
    const [hasMoreEvents, setHasMoreEvents] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function getEvents(firstLoad: boolean){
        try{
            if(firstLoad)
                setIsLoading(true);

            let res;
            if(!userHeader)
                res = await ExtensionService.getTopEvents(currentEventPage);
            else 
                res = await ExtensionService.getPossibleUserEvents(userHeader.id, currentEventPage);

            setEvents([...events, ...res.data]);
            setIsLoading(false);
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
        <div className="events-cont">
            <h1 className="title">Events</h1>
            <CalendarComp events={ events } showClub={ true } userHeader={ userHeader }/>
            { hasMoreEvents &&
                <Button 
                    content="Load More"
                    onBtnClick={ () => getEvents(false) }
                />
            }
        </div>
    );
}