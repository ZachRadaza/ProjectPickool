import { useEffect, useMemo, useState } from "react";
import { EventType, type Hosts, Role, type Club_Members, type Events, type Players, type UserHeader, EventButtonSituation, Recurring } from "../../../utils/schemas";
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
import EventIconsComp from "../../pages/events/EventIconsComp";
import EventParticipantsComp from "../../pages/events/EventParticipantsComp";
import EventButtonComp from "../../pages/events/EventButtonsComp";
import TwoOptionPopup from "../general/TwoOptionPopup";
import HostSearchPopup from "../../pages/events/HostSearchPopup";

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
    const [deleteConfirmationClosed, setDeleteConfirmationClosed] = useState<boolean>(true);
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

    const deleteConfirmationPopupContents = event?.recurring === Recurring.NONE || !event?.series_id 
        ? {
            title: "Delete Event",
            body: "Do you want to delete this event?",
            btn2Content: "Cancel",
            btn2Click: () => {},
            btn2Red: false
        }
        : {
            title: "Delete Recurring Event?",
            body: "Delete all future events as well?",
            btn2Content: "Delete All Future Events",
            btn2Click: deleteRecurringEvent,
            btn2Red: true 
        }

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

    async function deleteRecurringEvent(){
        if(!event?.id || !event.series_id)
            return;

        const deleted = await ExtensionService.deleteEventSeries(event.id, event.series_id);

        if(!deleted){
            setError("error in deleting event");
            return;
        }

        closeEventPopup(true);
        window.location.reload();
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
                    { (playersApproved.length === 0 || !!event?.start_time && Date.now() > new Date(event.start_time).getTime()) &&
                        <DeleteButton 
                            onBtnClick={ () => setDeleteConfirmationClosed(false) }
                        />
                    }
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
                <HostSearchPopup 
                    hosts={ hosts }
                    setSearchHostsClosed={ setSearchHostsClosed }
                    searchHostsClosed={ searchHostsClosed }
                    setError={ setError }
                    setHosts={ setHosts }
                    event={ event }
                />
                <PopupWrapper 
                    popupComp={
                        <TwoOptionPopup 
                            title={ deleteConfirmationPopupContents.title }
                            body={ deleteConfirmationPopupContents.body }
                            btn1Content="Delete this event"
                            btn2Content={ deleteConfirmationPopupContents.btn2Content }
                            btn1Click={ () => deleteEvent() }
                            btn2Click={ deleteConfirmationPopupContents.btn2Click }
                            setIsClosed={ setDeleteConfirmationClosed }
                            btn1Red={ true }
                            btn2Red={ deleteConfirmationPopupContents.btn2Red }
                        />
                    }
                    isClosed={ deleteConfirmationClosed }
                />
            </div>
        </>
    );
}