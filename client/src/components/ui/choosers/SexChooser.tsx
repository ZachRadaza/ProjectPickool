import { useState } from "react";
import { Sex } from "../../../utils/schemas";
import Button from "../buttons/Button";
import "./Chooser.css";

type SexChooserProp = {
    sex: Sex;
    setSex: (sex: Sex) => void;
};

export default function SexChooser({ sex, setSex }: SexChooserProp){
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    function dropdownClicked(sex: Sex){
        setSex(sex);
        setIsDropdownOpen(false);
    }

    return (
        <div className="chooser">
            <Button content={ sex } onBtnClick={ () => setIsDropdownOpen(!isDropdownOpen) } additionalClasses="current"/>
            <div className={`drop-down ${isDropdownOpen ? "active" : ""}`}>
                <button onClick={ () => dropdownClicked(Sex.MALE) }>Male</button>
                <button onClick={ () => dropdownClicked(Sex.FEMALE) }>Female</button>
                <button onClick={ () => dropdownClicked(Sex.MIXED) }>Mixed</button>
            </div>
        </div>
    );
}