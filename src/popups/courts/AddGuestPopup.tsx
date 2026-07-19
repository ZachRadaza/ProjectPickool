import { useEffect, useRef, useState } from "react";
import CloseButton from "../../components/ui/buttons/CloseButton";
import type { UserHeader } from "../../utils/schemas";
import Button from "../../components/ui/buttons/Button";
import "./AddGuestPopup.css";

type AddGuestPopupProp = {
    setIsClosed: (closed: boolean) => void;
    addPlayer: (player: UserHeader) => void;
};

export default function AddGuestPopup({ setIsClosed, addPlayer }: AddGuestPopupProp){
    const [nameInput, setNameInput] = useState<string>("");

    const nameInputRef = useRef<HTMLInputElement | null>(null);

    function createAndAddPlayer(){
        setIsClosed(true);

        const newPlayer: UserHeader = {
            id: `guest|${nameInput}|${crypto.randomUUID()}`,
            username: nameInput,
            profile_pic: import.meta.env.VITE_DEFAULT_PROFILE_PIC
        };

        addPlayer(newPlayer);
    }

    useEffect(() => {
        nameInputRef.current?.focus();
    });

    return (
        <div className="popup add-guest-popup">
            <CloseButton setIsClosed={ setIsClosed }/>
            <h4>Add Guest Player</h4>
            <div className="input-pair">
                <h6>Name</h6>
                <input 
                    value={ nameInput }
                    onChange={ (event) => setNameInput(event.target.value) }
                    onKeyDown={ (e) => {
                        if(e.key === "Enter")
                            createAndAddPlayer();
                    }}
                    ref={ nameInputRef }
                />
            </div>
            <div className="btn-options">
                <Button content="Cancel" onBtnClick={ () => setIsClosed(true) } additionalClasses="red"/>
                <Button content="Add Guest" onBtnClick={ createAndAddPlayer }/>
            </div>
        </div>
    );
}