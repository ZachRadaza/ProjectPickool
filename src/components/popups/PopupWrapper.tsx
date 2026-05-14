import type React from "react"
import { useEffect, useState } from "react";
import { wait } from "../../utils/random";

type PopupWrapperProp = {
    popupComp: React.ReactNode;
    isClosed: boolean;
    isMaxWidth?: boolean;
    noBgPointerEvents?: boolean;
}

export default function PopupWrapper({ popupComp, isClosed, isMaxWidth, noBgPointerEvents }: PopupWrapperProp){
    const [isRendered, setIsRendered] = useState<boolean>(false);
    const [popupClosed, setPopupClosed] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;

        async function closePopup() {
            if(isClosed){
                setPopupClosed(true);
                await wait(400);

                if(!cancelled)
                    setIsRendered(false);
            } else {
                setIsRendered(true);
                setPopupClosed(false);
            }
        }

        closePopup();
        return () => { cancelled = true; };
    }, [isClosed]);

    return (
        <div className={ `container ${noBgPointerEvents ? "no-pt-events" : ""}`}>
            <div className={`popup-wrapper ${popupClosed ? "closed" : ""} ${isMaxWidth ? "max-width" : ""}`}>
            { isRendered && popupComp }
            </div>
        </div>
    );
}