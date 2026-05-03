import React, { useMemo, useState } from "react";
import { Recurring, type Events, type Hosts } from "../../../utils/schemas";
import UserSearchPopup from "../../popups/clubs/UserSearchPopup";
import TwoOptionPopup from "../../popups/general/TwoOptionPopup";
import PopupWrapper from "../../popups/PopupWrapper";
import { ExtensionService } from "../../../utils/ExtensionService";

type HostSearchPopup = {
    event: Events | null;
    hosts: Hosts[];
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setHosts: React.Dispatch<React.SetStateAction<Hosts[]>>;
    searchHostsClosed: boolean;
    setSearchHostsClosed: React.Dispatch<boolean>;
};

export default function HostSearchPopup({ event, setError, setHosts, setSearchHostsClosed, searchHostsClosed, hosts }: HostSearchPopup){
    const [hostConfirmationClosed, setHostConfirmationClosed] = useState<boolean>(true);
    const [hostPreviewedId, setHostPreviewedId] = useState<string | null>("");

    const usersApproved = useMemo(() => {
        return hosts.map((host) => host.user ? host.user : null).filter((user) => user !== null);
    }, [hosts]);

    function openHostConfirmation(user_id: string){
        setHostPreviewedId(user_id);

        if(event?.recurring !== Recurring.NONE)
            setHostConfirmationClosed(false);
        else
            addHosts(user_id);

    }

    async function addHosts(user_id: string){
        if(!user_id || !event?.id)
            return;

        const host = await ExtensionService.addHost(event.id, user_id);

        if(!host){
            setError("Error In adding host");
            return;
        }

        setHosts([...hosts, host]);
    }

    async function addHostRecurring(user_id: string){
        if(!user_id || !event?.series_id)
            return;

        const host = await ExtensionService.addHostSeries(event.series_id, user_id);

        if(!host){
            setError("Error In adding host");
            return;
        }

        setHosts([...hosts, host]);
    }

    return (
        <div className="host-search-popup">
            <PopupWrapper 
                popupComp={ 
                    <UserSearchPopup
                        club_id={ event?.club?.id ? event?.club.id : null }
                        canApprove={ true }
                        setIsClosed={ setSearchHostsClosed }
                        approveClicked={ openHostConfirmation }
                        approveContent="Add Host"
                        usersApproved={ usersApproved }
                    />
                }
                isClosed={ searchHostsClosed }
            />
            <PopupWrapper
                popupComp={
                    <TwoOptionPopup
                        title="Add Host"
                        body="Add Hosts to all recurring events or only this one."
                        btn1Content="Add Host"
                        btn1Click={ () => addHosts(hostPreviewedId ? hostPreviewedId : "") }
                        btn2Content="Add Host to All Future Events"
                        btn2Click={ () => addHostRecurring(hostPreviewedId ? hostPreviewedId : "") }
                        setIsClosed={ setHostConfirmationClosed }
                    />
                }
                isClosed={ hostConfirmationClosed }
            />
        </div>
    );
}