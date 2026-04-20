import { useNavigate } from "react-router-dom";
import { capitalizeWords } from "../../../utils/random";
import type { Events, Players } from "../../../utils/schemas";
import "./EventsComp.css";

type EventsCompProp = {
    event: Events | null;
    player?: Players | null;
    showClub?: boolean;
};

export default function EventsComp({ event, player, showClub }: EventsCompProp){
    const navigate = useNavigate();

    function openEvent(){
        const params = new URLSearchParams(location.search);
        params.set("event", event?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    return (
        <div className="events-comp" onClick={() => openEvent() }>
            <div className="left-side">
                <h6 className="time">
                    { event?.start_time ? new Date(event.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    }) : "" }
                </h6>
                <h6 className="type">{ !event?.is_tournament ? "Casual" : "Tournament" }</h6>
            </div>
            <div className="right-side">
                <div className="heading-info">
                    { player && (
                        player.approved
                            ? <p className="attribute-tag secondary joined">Joined</p>
                            : <p className="attribute-tag secondary joined">Requested</p>
                    )}
                    <h5 className="event-name">{ event?.name ?? "Event" }</h5>
                    <div className="tags">
                        <p className="attribute-tag accent">{ capitalizeWords(event?.level) }</p>
                        <p className="attribute-tag accent">{ capitalizeWords(event?.sex) }</p>
                        <p className="attribute-tag accent">{ event?.is_singles ? "Singles" : "Doubles" }</p>
                        <p className="attribute-tag accent">{ event?.is_dupr ? "DUPR" : "No DUPR" }</p>
                    </div>
                </div>
                <div className="other-info">
                    <h6>{ event?.max_players } Players</h6>
                    <h6>•</h6>
                    <h6>{ event?.price! > 0 ? `₱${event?.price} Entry` : "Free" }</h6>
                    { showClub &&
                        <>
                            <h6 className="hosted-by">•</h6>
                            <h6 className="hosted-by">Hosted By { event?.club?.name }</h6>
                        </>
                    }
                </div>
            </div>
            <svg className="bg-icon" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 100 100">
                <g>
                <path d="m58.531 87.625h-51.281l0.25-0.5625 33.969-74.688h51.281l-0.25 0.5625-33.969 74.719zm-50.094-0.78125h49.594l33.5-73.688h-49.562l-33.5 73.688z"/>
                <path d="m32.5 32.594h50.438v0.78125h-50.438z"/>
                <path d="m58.781 33.156-0.71875-0.3125 9.2188-20.25 0.71875 0.3125z"/>
                <path d="m17.062 66.625h50.438v0.78125h-50.438z"/>
                <path d="m33.375 87.406-0.71875-0.3125 9.2188-20.25 0.6875 0.3125z"/>
                <path d="m74.562 52.688h-51.406v-10.156h51.406zm-50.625-0.78125h49.844v-8.5938h-49.844z"/>
                </g>
            </svg>
        </div>  
    );
}