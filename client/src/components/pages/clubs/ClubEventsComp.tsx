import { useEffect, useState } from "react";
import { Role, type Club_Members, type Events } from "../../../utils/schemas";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import { ExtensionService } from "../../../utils/ExtensionService";
import CalendarComp from "../events/CalendarComp";

type ClubsEventCompProp = {
    club_id: string | null;
    setClosedModifyEvent?: (closed: boolean) => void;
    userClubMember?: Club_Members | null;
};

export default function ClubEventsComp({ club_id, setClosedModifyEvent, userClubMember }: ClubsEventCompProp){
    const [events, setEvents] = useState<Events[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    let content;

    useEffect(() => {
        getClubEvents();

        async function getClubEvents(){
            try{
                setIsLoading(true);
                if(!club_id){
                    setIsLoading(false);
                    return;
                }

                const clubEvents = await ExtensionService.getClubEvents(club_id);

                if(!clubEvents){
                    setIsLoading(false);
                    setError("Error in Fetching Events");
                }

                setEvents(clubEvents);
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Error in Getting Club Events");
            }
        }
    }, [club_id]);

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error } />;
    else
        content = <>
            { userClubMember?.role === Role.ADMIN || userClubMember?.role === Role.OWNER
                ? <CalendarComp events={ events } setClosedModifyEvent={ setClosedModifyEvent } userHeader={ userClubMember.user }/>
                : <CalendarComp events={ events } userHeader={ userClubMember?.user ?? null } />
            }
        </>

    return (
        <div>
            { content }
        </div>
    );
}