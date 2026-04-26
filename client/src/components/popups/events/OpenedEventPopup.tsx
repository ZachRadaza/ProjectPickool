import { useEffect, useMemo, useState } from "react";
import { EventType, type Hosts, Role, type Club_Members, type Events, type Players, type UserHeader, EventButtonSituation } from "../../../utils/schemas";
import CloseButton from "../../ui/buttons/CloseButton";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import { ExtensionService } from "../../../utils/ExtensionService";
import { useNavigate } from "react-router-dom";
import "../popup.css";
import { capitalizeWords } from "../../../utils/random";
import "./OpenedEventPopup.css";
import EditButton from "../../ui/buttons/EditButton";
import DeleteButton from "../../ui/buttons/DeleteButton";
import PopupWrapper from "../PopupWrapper";
import UserSearchPopup from "../clubs/UserSearchPopup";
import EventIconsComp from "../../pages/events/EventIconsComp";
import EventParticipantsComp from "../../pages/events/EventParticipantsComp";
import EventButtonComp from "../../pages/events/EventButtonsComp";

type OpenedEventPopupProp = {
    setIsClosed: (closed: boolean) => void;
    event_id: string | null;
    setClosedModifyEvent: (closed: boolean) => void;
    userHeader: UserHeader | null;
}

export default function OpenedEventPopup({ setIsClosed, event_id, setClosedModifyEvent, userHeader }: OpenedEventPopupProp){
    const [event, setEvent] = useState<Events | null>(null);
    const [userMember, setUserMember] = useState<Club_Members | null>(null);
    const [hosts, setHosts] = useState<Hosts[]>([]);
    const [playersApproved, setPlayersApproved] = useState<Players[]>([]);
    const [playersNotApproved, setPlayersNotApproved] = useState<Players[]>([]);

    const [searchHostsClosed, setSearchHostsClosed] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    let content;

    const buttonSituation = useMemo(() => {
        if(!userMember)
            return EventButtonSituation.NOT_MEMBER;

        for(const player of playersApproved){
            if(player.user!.id === userHeader?.id){
                if(player.paid)
                    return EventButtonSituation.COMPLETE;
                else 
                    return EventButtonSituation.JOINED;
            }
        }

        for(const player of playersNotApproved){
            if(player.user!.id === userHeader?.id){
                return EventButtonSituation.REQUESTED;
            }
        }

        return EventButtonSituation.MEMBER;
    }, [userMember, playersApproved, playersNotApproved]);

    const userIsHost = useMemo(() => {
        if(!userMember || hosts.length === 0)
            return false;

        for(const host of hosts)
            if(host.user?.id === userMember.user.id)
                return true;

        return false;
    }, [hosts, userMember]);

    function closeEventPopup(closed: boolean){
        setIsClosed(closed);

        const params = new URLSearchParams(location.search);
        params.delete("event");

        navigate({
            pathname: location.pathname,
            search: params.toString(),
        });
    }

    function openClub(){
        if(!event?.club?.id)
            return;

        closeEventPopup(true);

        navigate(`?club=${event.club.id}`);
    }

    async function deleteEvent(){
        if(!event?.id)
            return;

        const deleted = await ExtensionService.deleteEvent(event.id);

        if(!deleted){
            setError("error in deleting event");
            return;
        }

        closeEventPopup(true);
        window.location.reload();
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

    useEffect(() => {
        getEvent();

        async function getEvent(){
            try{
                setIsLoading(true);
                setIsClosed(false);
                if(!event_id){
                    setIsLoading(false);
                    setIsClosed(true);
                    setIsClosed(true);
                    return;
                }

                const eventData = await ExtensionService.getEvent(event_id);
                const hostsData = await ExtensionService.getEventHosts(event_id);
                const playersData = await ExtensionService.getEventPlayers(event_id);

                if(!eventData || !playersData || !hostsData){
                    setIsLoading(false);
                    setError("Error in Getting Event");
                    return;
                }

                setEvent(eventData);
                setHosts(hostsData);
                setPlayersApproved(playersData.filter((player) => player.approved));
                setPlayersNotApproved(playersData.filter((player) => !player.approved));

                await getUserMember(eventData);
                
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Error in Getting Event");
            }
        }

        async function getUserMember(eventData: Events){
            if(!userHeader || !eventData.club?.id)
                return;

            const member = await ExtensionService.getSingleClubMember(eventData.club.id, userHeader.id);

            if(!member)
                setUserMember(null);
            else
                setUserMember(member);
        }
    }, [event_id, userHeader]);

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error } />;
    else
        content = <>
            <div className="headers">
                <h4>{ event?.name ?? "Event Name" }</h4>
                <h6 className="date">{`${ 
                    new Date(event?.start_time!).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    }) } @ ${ 
                    event?.start_time ? new Date(event.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                    }) : "" }`}
                </h6>
                <div className="host-club">
                    <h6>Hosting Club: </h6>
                    <h6 onClick={ () => openClub() } className="club-name">
                        { event?.club?.name }
                    </h6>
                </div>
                <div className="tags">
                    <p className="attribute-tag accent">
                        { event?.event_type === EventType.DUPR 
                            ? event.event_type.toUpperCase()
                            : capitalizeWords(event?.event_type)
                        }
                    </p>
                    <p className="attribute-tag accent">{ capitalizeWords(event?.level) }</p>
                    <p className="attribute-tag accent">{ capitalizeWords(event?.sex) }</p>
                    <p className="attribute-tag accent">{ event?.is_singles ? "Singles" : "Doubles" }</p>
                </div>
            </div>
            { userMember?.role === Role.ADMIN || userMember?.role === Role.OWNER &&
                <div className="event-actions-cont">
                    <EditButton
                        onBtnClick={ () => setClosedModifyEvent(false) }
                    />
                    <DeleteButton 
                        onBtnClick={ () => deleteEvent() }
                    />
                </div>
            }
            <EventIconsComp event={ event } />
            { event?.description &&
                <div className="desc-cont">
                    <h6>Description</h6>
                    <p>{ event.description }</p>
                </div>
            }
            <EventParticipantsComp
                event={ event }
                hosts={ hosts }
                playersApproved={ playersApproved }
                playersNotApproved={ playersNotApproved }
                userMember={ userMember }
                setSearchHostsClosed={ setSearchHostsClosed }
                userIsHost={ userIsHost }
                setPlayersApproved={ setPlayersApproved }
                setPlayersNotApproved={ setPlayersNotApproved }
                setError={ setError }
            />
            <EventButtonComp 
                event={ event }
                userMember={ userMember }
                playersApproved={ playersApproved }
                playersNotApproved={ playersNotApproved }
                buttonSituation={ buttonSituation }
                userIsHost={ userIsHost }
                openClub={ openClub }
                setPlayersApproved={ setPlayersApproved }
                setPlayersNotApproved={ setPlayersNotApproved }
                setError={ setError }
            />
        </>;

    return (
        <>
            <div className="popup opened-event">
                <CloseButton setIsClosed={ closeEventPopup } />
                { content }
                <PopupWrapper 
                    popupComp={ 
                        <UserSearchPopup
                            club_id={ event?.club?.id ? event?.club.id : null }
                            canApprove={ true }
                            setIsClosed={ setSearchHostsClosed }
                            approveClicked={ addHosts }
                            approveContent="Add Host"
                            usersApproved={ hosts.map((host) => host.user ? host.user : null).filter((user) => user !== null) }
                        />
                    }
                    isClosed={ searchHostsClosed }
                />
            </div>
        </>
    );
}