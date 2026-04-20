import { useState } from "react";
import { Recurring } from "../../../utils/schemas";
import Button from "../buttons/Button";
import "./Chooser.css";

type RecurringChooserProp = {
    recurring: Recurring;
    setRecurring: (recur: Recurring) => void;
};

export default function RecurringChooser({ recurring, setRecurring}: RecurringChooserProp){
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    function dropdownClicked(recur: Recurring){
        setRecurring(recur);
        setIsDropdownOpen(false);
    }

    return (
        <div className="chooser">
            <Button content={ recurring } onBtnClick={ () => setIsDropdownOpen(!isDropdownOpen) } additionalClasses="current"/>
            <div className={`drop-down ${isDropdownOpen ? "active" : ""}`}>
                <button onClick={ () => dropdownClicked(Recurring.NONE) }>None</button>
                <button onClick={ () => dropdownClicked(Recurring.DAILY) }>Daily</button>
                <button onClick={ () => dropdownClicked(Recurring.WEEKLY) }>Weekly</button>
                <button onClick={ () => dropdownClicked(Recurring.BIWEEKLY) }>Bi-Weekly</button>
                <button onClick={ () => dropdownClicked(Recurring.MONTLY) }>Monthly</button>
            </div>
        </div>
    );
}