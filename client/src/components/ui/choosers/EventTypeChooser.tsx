import { useState } from "react";
import Button from "../buttons/Button";
import "./Chooser.css";
import { EventType } from "../../../utils/schemas";

type EventTypeChooserProp = {
    event_type: EventType;
    setEventType: (type: EventType) => void;
};

export default function EventTypeChooser({ event_type, setEventType }: EventTypeChooserProp){
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    function dropdownClicked(event_type: EventType){
        setEventType(event_type);
        setIsDropdownOpen(false);
    }

    return (
        <div className="chooser">
            <Button content={ event_type } onBtnClick={ () => setIsDropdownOpen(!isDropdownOpen) } additionalClasses="current"/>
            <div className={`drop-down ${isDropdownOpen ? "active" : ""}`}>
                <button onClick={ () => dropdownClicked(EventType.CASUAL) }>Casual</button>
                <button onClick={ () => dropdownClicked(EventType.TOURNAMENT) }>Tournament</button>
                <button onClick={ () => dropdownClicked(EventType.DUPR) }>DUPR</button>
            </div>
        </div>
    );
}