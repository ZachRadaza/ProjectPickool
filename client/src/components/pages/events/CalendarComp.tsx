import { useEffect, useState } from "react";
import type { EventPlayer, Events, Players, UserHeader } from "../../../utils/schemas";
import EventsComp from "../../ui/core/EventsComp";
import Button from "../../ui/buttons/Button";
import "./CalendarComp.css";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import { ExtensionService } from "../../../utils/ExtensionService";

type CalendarCompProp = {
    events: Events[];
    setClosedModifyEvent?: (closed: boolean) => void;
    showClub?: boolean;
    userHeader?: UserHeader | null;
};

export default function CalendarComp({ events, setClosedModifyEvent, showClub, userHeader }: CalendarCompProp){
    const [eventsSorted, setEventsSorted] = useState<Map<string, EventPlayer[]>>(new Map());
    const [pastEventsSorted, setPastEventsSorted] = useState<Map<string, EventPlayer[]>>(new Map());
    const [isEventsSorted, setIsEventSorted] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const currentSorted = isEventsSorted ? eventsSorted : pastEventsSorted;

    function parseLocalDate(key: string){
        const [y, m, d] = key.split("-").map(Number);
        return new Date(y, m - 1, d);
    }

    useEffect(() => {
        getEventUserPlayer();
        async function getEventUserPlayer(){
            try{
                setIsLoading(true);
                if(!userHeader){
                    sortEvents([]);
                    setIsLoading(false);
                    return;
                }

                const userPlayers = await ExtensionService.getUserPlayers(userHeader.id);

                if(!userPlayers || userPlayers.length === 0){
                    sortEvents([]);
                    setIsLoading(false);
                    return;
                }

                sortEvents(userPlayers);
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Error in loading user event information");
            }
        }

        function sortEvents(userPlayers: Players[]){
            const playerMap = new Map(userPlayers.map((player) => [player.event_id, player]));
            const eventP: EventPlayer[] = [];

            for(const event of events){
                const player = playerMap.get(event.id!);
                if(player)
                    eventP.push({ event, player });
                else
                    eventP.push({ event, player: null });
            }

            const sorted: Map<string, EventPlayer[]> = new Map();
            const pastSorted: Map<string, EventPlayer[]> = new Map();
            const todayKey = new Date().toLocaleDateString("en-CA");

            for(const eventPlayer of eventP){
                const key = new Date(eventPlayer.event.start_time).toLocaleDateString("en-CA").split("T")[0];
                
                if(key < todayKey){
                    if(!pastSorted.has(key))
                        pastSorted.set(key, []);

                    pastSorted.get(key)!.push(eventPlayer);
                } else {
                    if(!sorted.has(key))
                        sorted.set(key, []);

                    sorted.get(key)!.push(eventPlayer);
                }
            }

            setEventsSorted(sorted);
            setPastEventsSorted(pastSorted);
        }
    }, [events]);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error } />;

    return (
        <div className="calendar-comp-cont">
            <div className="tabs">
                <Button 
                    content="Active"
                    onBtnClick={ () => setIsEventSorted(true) }
                    additionalClasses={`bg ${isEventsSorted ? "active" : ""}` }
                />
                <Button 
                    content="Past"
                    onBtnClick={ () => setIsEventSorted(false) }
                    additionalClasses={`bg ${!isEventsSorted ? "active" : ""}` }
                />
                { setClosedModifyEvent &&
                    <Button
                        content="+ Add Event"
                        onBtnClick={ () => setClosedModifyEvent(false) }
                    />
                }
            </div>
            <div className="events-list-cont">
                { currentSorted.size > 0
                    ? <>{ [...currentSorted.entries()]
                        .sort(([a], [b]) => isEventsSorted ? a.localeCompare(b) : b.localeCompare(a))
                        .map(([key, eventsList]) =>
                            <div className="events-on-date" key={ key }>
                                <h5>
                                    { parseLocalDate(key).toLocaleDateString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric"
                                    }) }
                                </h5>
                                { eventsList.map((e) =>
                                    <EventsComp event={ e.event } showClub={ showClub } player={ e.player } key={ e.event.id }/>
                                )}
                            </div>
                        )
                    } </> 
                    : <h6>No Events Listed</h6>
                }
            </div>
        </div>
    );
}