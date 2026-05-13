import { useState } from "react";
import { Level } from "../../../utils/schemas";
import "./Chooser.css";
import Button from "../buttons/Button";

type LevelChooserProp = {
    isPlayer: boolean;
    setLevel: (level: Level) => void;
    level: Level;
};

export default function LevelChooser({ isPlayer, level, setLevel }: LevelChooserProp){
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    function dropdownClicked(levelClicked: Level){
        setLevel(levelClicked);
        setIsDropdownOpen(false);
    }

    return (
        <div className="chooser">
            <Button content={ level } onBtnClick={ () => setIsDropdownOpen(!isDropdownOpen) } additionalClasses="current"/>
            <div className={`drop-down ${isDropdownOpen ? "active" : ""}`}>
                <button onClick={ () => dropdownClicked(Level.BEGINNER) }>Beginner</button>
                <button onClick={ () => dropdownClicked(Level.INTERMEDIATE) }>Intermediate</button>
                <button onClick={ () => dropdownClicked(Level.ADVANCED) }>
                    Advanced
                </button>
                { !isPlayer && 
                    <button 
                        onClick={ () => dropdownClicked(Level.ALL) }
                    >
                        All
                    </button> 
                }
            </div>
        </div>
    );
}