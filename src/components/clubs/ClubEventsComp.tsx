import { useEffect, useState } from "react";
import { Role, type Club_Members, type Events } from "../../utils/schemas";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import { ExtensionService } from "../../utils/ExtensionService";
import CalendarComp from "../events/CalendarComp";
import Button from "../ui/buttons/Button";
import "./ClubEventsComp.css";

type ClubsEventCompProp = {
    club_id: string | null;
    setClosedModifyEvent?: (closed: boolean) => void;
    userClubMember?: Club_Members | null;
};

export default function ClubEventsComp({ club_id, setClosedModifyEvent, userClubMember }: ClubsEventCompProp){
    const [events, setEvents] = useState<Events[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMoreEvents, setHasMoreEvents] = useState<boolean>(true);
    const [buttonIsLoading, setButtonIsLoading] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    let content;

    async function getClubEvents(isLoadMore: boolean){
        try{
            isLoadMore ? setButtonIsLoading(true) : setIsLoading(true);
            if(!club_id){
                setIsLoading(false);
                return;
            }

            const { data: clubEvents, hasMore } = await ExtensionService.EventService.getClubEvents(club_id, currentPage);

            if(!clubEvents){
                setIsLoading(false);
                setError("Error in Fetching Events");
            }

            setEvents([...events, ...clubEvents]);
            setHasMoreEvents(hasMore)
            setCurrentPage(currentPage + 1);
            setIsLoading(false);
            setButtonIsLoading(false);
        } catch(error){
            setIsLoading(false);
            setError("Error in Getting Club Events");
        }
    }

    useEffect(() => {
        getClubEvents(false);
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
            { hasMoreEvents && 
                <Button
                    onBtnClick={ () => getClubEvents(true) }
                    content={ buttonIsLoading ? "Loading More..." : "Load More" }
                />
            }
        </>

    return (
        <div className="club-events-comp-cont">
            { content }
        </div>
    );
}