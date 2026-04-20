import { useEffect, useState } from "react";
import CalendarComp from "../components/pages/events/CalendarComp";
import type { Events, UserHeader } from "../utils/schemas";
import Loading from "./Loading";
import ErrorPage from "./Error";
import { useOutletContext } from "react-router-dom";
import { ExtensionService } from "../utils/ExtensionService";
import "./Events.css";

type EventContext = {
    userHeader: UserHeader | null;
}

export default function Events(){
    const { userHeader } = useOutletContext<EventContext>();

    const [events, setEvents] = useState<Events[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getEvents();

        async function getEvents(){
            try{
                setIsLoading(true);

                if(!userHeader){
                    //show events near location
                    return;
                }

                const eventsData = await ExtensionService.getPossibleUserEvents(userHeader.id);

                setEvents(eventsData);
                setIsLoading(false);
            } catch(error){
                setError("Error in getting events");
                setIsLoading(false);
            }
        }
    }, []);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error } />;

    return (
        <div className="events-cont">
            <h1 className="title">Events</h1>
            <CalendarComp events={ events } showClub={ true } userHeader={ userHeader }/>
        </div>
    );
}