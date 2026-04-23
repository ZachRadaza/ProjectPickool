import type React from "react"
import { useEffect, useState } from "react";
import { wait } from "../../utils/random";

type PopupWrapperProp = {
    popupComp: React.ReactNode;
    isClosed: boolean;
    isMaxWidth?: boolean;
}

export default function PopupWrapper({ popupComp, isClosed, isMaxWidth }: PopupWrapperProp){
    const [isRendered, setIsRendered] = useState<boolean>(false);
    const [popupClosed, setPopupClosed] = useState<boolean>(true);

    useEffect(() => {
        closePopup();

        async function closePopup(){
            if(isClosed){
                setPopupClosed(true);
                await wait(400);
                setIsRendered(false);
            } else {
                setIsRendered(true);
                setPopupClosed(false);
            }
        }
    }, [isClosed]);

    return (
        <div className="container">
            <div className={`popup-wrapper ${popupClosed ? "closed" : ""} ${isMaxWidth ? "max-width" : ""}`}>
            { isRendered && popupComp }
            </div>
        </div>
    );
}