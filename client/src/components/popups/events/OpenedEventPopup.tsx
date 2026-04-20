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
            <div className="info">
                <div className="info-line">
                    <svg viewBox="-0.5 0 15 15" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M61,154.006845 C61,153.45078 61.4499488,153 62.0068455,153 L73.9931545,153 C74.5492199,153 75,153.449949 75,154.006845 L75,165.993155 C75,166.54922 74.5500512,167 73.9931545,167 L62.0068455,167 C61.4507801,167 61,166.550051 61,165.993155 L61,154.006845 Z M62,157 L74,157 L74,166 L62,166 L62,157 Z M64,152.5 C64,152.223858 64.214035,152 64.5046844,152 L65.4953156,152 C65.7740451,152 66,152.231934 66,152.5 L66,153 L64,153 L64,152.5 Z M70,152.5 C70,152.223858 70.214035,152 70.5046844,152 L71.4953156,152 C71.7740451,152 72,152.231934 72,152.5 L72,153 L70,153 L70,152.5 Z" transform="translate(-61 -152)"/>
                    </svg>
                    <div className="lines">
                        <h6>
                            { new Date(event?.start_time!).toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </h6>
                        <p className="times">{
                            `${ event?.start_time ? new Date(event.start_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            }) : "" } - ${ event?.end_time ? new Date(event.end_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                            }) : "" }`}
                        </p>
                    </div>
                </div>
                <div className="info-line">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.6 -3.2 35.2 43.2">
                        <path d="M5.99,28.46l-.81,.81c-.3,.3-.78,.3-1.08,0l-1.37-1.37c-.3-.3-.3-.78,0-1.08l.85-.85c.08-.08,.2-.08,.28,0l3.52-3.52,2.17,2.17-3.52,3.52s.06,.22-.04,.32Z"/>
                        <path d="M28.05,15.49l-6.42,6.42c-1.58,1.58-3.96,1.86-5.82,.84h0c-2.73-.99-4.14,.42-4.14,.42l-.37,.37c-.21,.21-.55,.21-.77,0l-2.07-2.07c-.21-.21-.21-.55,0-.77l.37-.37s1.41-1.42,.42-4.14h0c-1.02-1.86-.74-4.25,.84-5.82l6.42-6.42c1.92-1.92,5.03-1.92,6.95,0l4.6,4.6c1.92,1.92,1.92,5.03,0,6.95Z"/>
                    </svg>
                    <div className="lines">
                        <h6>{event?.is_singles ? "Singles" : "Doubles"} { event?.is_tournament ? "Tournament" : "Casual" }</h6>
                        <p>{ event?.is_dupr ? "DUPR •" : "" } { capitalizeWords(event?.sex) } • { capitalizeWords(event?.level) }</p>
                    </div>
                </div>
                <div className="info-line">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 12.692 11.308 3H3v8.308L12.692 21ZM9.923 9.923a1.958 1.958 0 1 1 0-2.769 1.957 1.957 0 0 1 0 2.769Z"/>
                    </svg>
                    <h6>{ event?.price === 0 ? "Free" : `₱${event?.price}` }</h6>
                </div>
            </div>
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