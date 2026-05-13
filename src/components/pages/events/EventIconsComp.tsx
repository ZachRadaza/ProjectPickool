import { convertSecondsToHours } from "../../../utils/random";
import type { Events } from "../../../utils/schemas";
import DateIconComp from "../../ui/icons/DateIconComp";
import EventInfoIconComp from "../../ui/icons/EventInfoIconComp";
import LocationIconComp from "../../ui/icons/LocationIconComp";
import PriceIconComp from "../../ui/icons/PriceIconComp";
import "./EventIconsComp.css";

type EventIconsCompProp = {
    event: Events | null;
}

export default function EventIconsComp({ event }: EventIconsCompProp){
    return ( <>
        { event &&
            <div className="event-icons-cont">
                <DateIconComp
                    startTime={ event?.start_time } 
                    endTime={ event?.end_time } 
                    name={ event.name }
                    description={ event.description }
                    address={ event.location?.address }
                />
                <LocationIconComp location={ event?.location ?? null } />
                <EventInfoIconComp 
                    eventType={ event.event_type }
                    isSingles={ event?.is_singles } 
                    level={ event?.level }
                    sex={ event?.sex }
                />
                <PriceIconComp price={ event?.price } hoursToPay={ convertSecondsToHours(event.approve_window ?? 0) }/>
            </div>
        }
    </>);
}