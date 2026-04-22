import { useEffect, useMemo, useState } from "react";
import { Role, type Club_Members, type Events, type Players, type UserHeader } from "../../../utils/schemas";
import CloseButton from "../../ui/buttons/CloseButton";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import { ExtensionService } from "../../../utils/ExtensionService";
import { useNavigate } from "react-router-dom";
import "../popup.css";
import { capitalizeWords } from "../../../utils/random";
import "./OpenedEventPopup.css";
import Button from "../../ui/buttons/Button";
import EditButton from "../../ui/buttons/EditButton";
import DeleteButton from "../../ui/buttons/DeleteButton";
import UsersDropdown from "../../pages/user/UsersDropdown";
import LocationIconComp from "../../ui/icons/LocationIconComp";
import DateIconComp from "../../ui/icons/DateIconComp";
import PriceIconComp from "../../ui/icons/PriceIconComp";
import EventInfoIconComp from "../../ui/icons/EventInfoIconComp";

type OpenedEventPopupProp = {
    isClosed: boolean;
    setIsClosed: (closed: boolean) => void;
    event_id: string | null;
    setClosedModifyEvent: (closed: boolean) => void;
    userHeader: UserHeader | null;
}

export default function OpenedEventPopup({ isClosed, setIsClosed, event_id, setClosedModifyEvent, userHeader }: OpenedEventPopupProp){
    const [event, setEvent] = useState<Events | null>(null);
    const [userMember, setUserMember] = useState<Club_Members | null>(null);
    const [playersApproved, setPlayersApproved] = useState<Players[]>([]);
    const [playersNotApproved, setPlayersNotApproved] = useState<Players[]>([]);
    const [message, setMessage] = useState<string | null>();
    const [joining, setJoining] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    let content;

    const canJoin = useMemo(() => {
        if(!userMember){
            setMessage("Not Member of Club");
            return false;
        }

        for(const player of playersApproved){
            if(player.user!.id === userHeader?.id){
                setMessage("Already Joined Event");
                return false;
            }
        }

        for(const player of playersNotApproved){
            if(player.user!.id === userHeader?.id){
                setMessage("Already Requested Event");
                return false;
            }
        }

        return true;
    }, [userMember, event, playersApproved, playersNotApproved]);

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

    async function joinEvent(){
        if(!userMember?.user|| !event?.id){
            setError("Cant join event, not a member");
            return;
        }

        setJoining(true);
        let approved = userMember.role === Role.ADMIN || userMember.role === Role.OWNER ? true : false;        
        const player = await ExtensionService.addPlayer(event.id, userMember.user.id, approved);

        if(!player){
            setError("Error in joining Event");
            setJoining(false);
            return;
        }

        if(approved)
            setPlayersApproved([...playersApproved, player]);
        else
            setPlayersNotApproved([...playersNotApproved, player]);
        
        setJoining(false);
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

    async function approveRequest(memberId: string){
        if(!event?.id || !memberId)
            return;

        const updates: Partial<Players> = { approved: true };

        const approved = await ExtensionService.updatePlayer(event?.id, memberId, updates);

        if(!approved){
            setError("Error in approving player");
            return;
        }

        setPlayersNotApproved(playersNotApproved.filter((p) => p.user!.id !== memberId));
        setPlayersApproved([...playersApproved, approved]);
    }

    async function denyRequest(memberId: string){
        if(!event?.id || !memberId)
            return;

        const denied = await ExtensionService.deletePlayer(event.id, memberId);

        if(!denied){
            setError("Error in denying player");
            return;
        }

        setPlayersNotApproved(playersNotApproved.filter((p) => p.user!.id !== memberId));
    }

    useEffect(() => {
        if(isClosed)
            return;

        setError(null);
        setIsLoading(true);
        setEvent(null);
        setUserMember(null);
        setPlayersApproved([]);
        setPlayersNotApproved([]);
        setMessage(null);
        setJoining(false);
    }, [isClosed]);

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
                const playersData = await ExtensionService.getEventPlayers(event_id);

                if(!eventData || !playersData){
                    setIsLoading(false);
                    setError("Error in Getting Event");
                    return;
                }

                setEvent(eventData);
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
                <div className="tags">
                    { event?.is_dupr && <p className="attribute-tag accent">DUPR</p> }
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
            { event && 
                <div className="icons">
                    <DateIconComp 
                        startTime={ event?.start_time } 
                        endTime={ event?.end_time } 
                        name={ event.name }
                        description={ event.description }
                        address={ event.location?.address }
                    />
                    <EventInfoIconComp 
                        isDUPR={ event?.is_dupr } 
                        isSingles={ event?.is_singles } 
                        isTournament={ event?.is_tournament } 
                        level={ event?.level }
                        sex={ event?.sex }
                    />
                    <LocationIconComp location={ event?.location ?? null } />
                    <PriceIconComp price={ event?.price } />
                </div>
            }
            { event?.description &&
                <div className="desc-cont">
                    <h6>Description</h6>
                    <p>{ event.description }</p>
                </div>
            }
            <div className="host-club">
                <h6>Hosting Club</h6>
                <div className="club" onClick={ () => openClub() } >
                    <img className="profile-pic" src={ event?.club?.profile_pic ?? import.meta.env.VITE_DEFAULT_CLUB_PIC }/>
                    <h6 className="name">{ event?.club?.name }</h6>
                </div>
            </div>
            { playersApproved.length > 0 &&
                <div className="approved-cont">
                    <UsersDropdown 
                        content={ `Current Players${ playersApproved.length >= (event?.max_players ?? 100) ? " (Full)" : ""}` }
                        users={ playersApproved.map((player) => player.user!) }
                        showNum={ true }
                        isMini={ true }
                    />
                </div>
            }
            { playersNotApproved.length > 0 &&
                <div className="not-approved-cont">
                    { userMember?.role === Role.ADMIN || userMember?.role === Role.OWNER
                        ? <UsersDropdown 
                            content="Requested"
                            showNum={ true }
                            users={ playersNotApproved.map((player) => player.user!) }
                            isMini={ false }
                            appovedClicked={ (id: string) => approveRequest(id) }
                            denyClicked={ (id: string) => denyRequest(id) }
                            isDisabled={ playersApproved.length >= (event?.max_players ?? 100) }
                        />
                        : <UsersDropdown 
                            content="Requested"
                            showNum={ true }
                            users={ playersNotApproved.map((player) => player.user!) }
                            isMini={ true }
                        />
                    }
                </div>
            }
            { userMember && canJoin
                ? <Button 
                        content={ joining ? "Joining Event..." : "Join Event" }
                        onBtnClick={() => joinEvent()}
                    />
                : <p className="cant-join-message">*Can't Join - { message ? message : "" }</p>
            }
        </>;

    return (
        <div className="container">
            <div className={`popup opened-event ${isClosed ? "closed" : ""}`}>
                <CloseButton setIsClosed={ closeEventPopup } />
                { content }
            </div>
        </div>
    );
}