import { useState, type Dispatch, type SetStateAction } from "react";
import CloseButton from "../../components/ui/buttons/CloseButton";
import Button from "../../components/ui/buttons/Button";
import PopupWrapper from "../PopupWrapper";
import ClubSearchPopup from "../clubs/ClubSearchPopup";
import type { UserHeader } from "../../utils/schemas";
import "./CreateOptionsPopup.css";

type CreateOptionsPopupProp = {
    userHeader: UserHeader | null;
    setIsClosed: Dispatch<SetStateAction<boolean>>;
    setClosedModifyEvent: Dispatch<SetStateAction<boolean>>;
    setClosedModifyClub: Dispatch<SetStateAction<boolean>>;
    setClosedModifyPost: Dispatch<SetStateAction<boolean>>;
}

export default function CreateOptionsPopup({ userHeader, setIsClosed, setClosedModifyClub, setClosedModifyEvent, setClosedModifyPost }: CreateOptionsPopupProp){
    const [creatingEvent, setCreatingEvent] = useState<boolean>(false);
    const [clubSearchIsClosed, setClubSearchIsClosed] = useState<boolean>(true);

    function createClub(){
        setClosedModifyClub(false);
        setIsClosed(true);
    }

    function createEvent(){
        setCreatingEvent(true);
        setClubSearchIsClosed(false);
    }

    function createPost(){
        setCreatingEvent(false);
        setClubSearchIsClosed(false);
    }

    return (
        <>
            <div className="popup create-options-popup mobile-short">
                <CloseButton 
                    setIsClosed={ setIsClosed }
                />
                <h4>Create</h4>
                <div className="btns-cont">
                    <Button content="Club" onBtnClick={ createClub }/>
                    <Button content="Event" onBtnClick={ createEvent }/>
                    <Button content="Post" onBtnClick={ createPost }/>
                </div>
            </div>
            <PopupWrapper
                popupComp={
                    <ClubSearchPopup
                        userHeader={ userHeader }
                        setIsClosed={ setClubSearchIsClosed }
                        setClosedModifyEvent={ setClosedModifyEvent }
                        setClosedModifyPost={ setClosedModifyPost }
                        setClosedCreateOptions={ setIsClosed }
                        creatingEvent={ creatingEvent }
                    />
                }
                isClosed={ clubSearchIsClosed }
            />
        </>
    );
}