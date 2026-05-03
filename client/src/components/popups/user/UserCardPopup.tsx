import { useEffect, useState } from "react";
import { Level, Role, type Club_Members, type Club_Members_Basic, type Club_Requests, type Players, type UserHeader } from "../../../utils/schemas";
import CloseButton from "../../ui/buttons/CloseButton";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import { ExtensionService } from "../../../utils/ExtensionService";
import { useNavigate } from "react-router-dom";
import "./UserCardPopup.css";
import "../popup.css";
import Button from "../../ui/buttons/Button";
import { capitalizeWords } from "../../../utils/random";

type UserCardPopupProp = {
    userCardId: string | null;
    club_id: string | null;
    event_id: string | null;
    userHeader: UserHeader| null;
    setIsClosed: (close: boolean) => void;
};

export default function UserCardPopup({ userHeader, userCardId, club_id, event_id, setIsClosed }: UserCardPopupProp){
    const [userInCard, setUserInCard] = useState<UserHeader | null>(null);
    const [clubMember, setClubMember] = useState<Club_Members_Basic | null>(null);
    const [clubRequest, setUserClubRequests] = useState<Club_Requests | null>(null);
    const [player, setPlayer] = useState<Players | null>(null);
    const [isCardHost, setIsCardHost] = useState<boolean>(false);
    const [isUserHost, setIsUserHost] = useState<boolean>(false);
    const [userClubMember, setUserClubMember] = useState<Club_Members_Basic | null>(null);
    const [eventSeriesId, setEventSeriesId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    let content;

    function closeCardPopup(closed: boolean){
        setIsClosed(closed);

        const params = new URLSearchParams(location.search);
        params.delete("previewuser");

        navigate({
            pathname: location.pathname,
            search: params.toString(),
        });
    }

    async function approveLevel(isApproved: boolean){
        if(!userCardId || userClubMember?.role === Role.MEMBER || !club_id)
            return;

        const updates: Partial<Club_Members_Basic> = { is_level_approved: isApproved };

        const approve = await ExtensionService.updateClubMember(club_id, userCardId, updates);

        if(!approve){
            setError("Error in approving rating");
            return;
        }

        setClubMember(() => clubMember ?
            { ...clubMember, is_level_approved: isApproved }
            : clubMember
        );
    }

    async function approveUserRequest(){
        if(!club_id || !userCardId)
            return;

        const approve = await ExtensionService.approveClubRequest(club_id, userCardId);

        if(!approve){
            setError("Error in Approving User");
            return;
        }

        setUserClubRequests(null);
        setClubMember({ club_id, user_id: userCardId, role: Role.MEMBER, is_favorite: false, is_level_approved: false });
    }

    async function denyUserRequest(){
        if(!club_id || !userCardId)
            return;

        const deny = await ExtensionService.denyClubRequest(club_id, userCardId);

        if(!deny){
            setError("Error in Denying User");
            return;
        }

        setUserClubRequests(null);
    }

    async function removePlayer(){
        if(!userCardId || !event_id)
            return;

        const removed = await ExtensionService.deletePlayer(event_id, userCardId);

        if(!removed){
            setError("Error in Removing PLayer from event");
            return;
        }

        setPlayer(null);
    }

    async function approvePlayer(approved: boolean){
        if(!userCardId || !event_id)
            return;

        const updates: Partial<Players> = { approved };

        const updatedPlayer = await ExtensionService.updatePlayer(event_id, userCardId, updates);

        if(!updatedPlayer){
            setError("Error in Player Update");
            return;
        }

        if(approved)
            setPlayer(updatedPlayer);
        else
            setPlayer(null);
    }

    async function setAdmin(){
        if(!club_id || !userCardId)
            return;

        const updates: Partial<Club_Members> = {
            role: Role.ADMIN
        };

        const admin = await ExtensionService.updateClubMember(club_id, userCardId, updates);

        if(!admin){
            setError("Error in Promoting User");
            return;
        }
        setClubMember(clubMember ? { ...clubMember, role: Role.ADMIN } : null);
    }

    async function demoteAdmin(){
        if(!club_id || !userCardId)
            return;

        const updates: Partial<Club_Members> = {
            role: Role.MEMBER
        };

        const member = await ExtensionService.updateClubMember(club_id, userCardId, updates);

        if(!member){
            setError("Error in Promoting User");
            return;
        }
        setClubMember(clubMember ? { ...clubMember, role: Role.MEMBER} : null);
    }

    async function kickMember(){
        if(!club_id || !userCardId)
            return;

        const kicked = await ExtensionService.deleteClubMember(club_id, userCardId);

        if(!kicked){
            setError("Error in Promoting User");
            return;
        }

        setClubMember(null);
    }

    async function addHost(){
        if(!userCardId || !event_id)
            return;

        const added = await ExtensionService.addHost(event_id, userCardId);

        if(!added){
            setError("Error in removing host");
            return;
        }

        setIsCardHost(true);
    }

    async function removeHost(){
        if(!userCardId || !event_id)
            return;

        const removed = await ExtensionService.deleteHost(event_id, userCardId);

        if(!removed){
            setError("Error in removing host");
            return;
        }

        setIsCardHost(false);
    }

    async function removeHostSeries(){
        if(!userCardId || !eventSeriesId)
            return;

        const removed = await ExtensionService.deleteHostSeries(eventSeriesId, userCardId);

        if(!removed){
            setError("Error in removing host from recurring event");
            return;
        }

        setIsCardHost(false);
    }

    useEffect(() => {
        getUserInCard();

        async function getUserInCard(){
            try{
                if(!userCardId){
                    setIsClosed(true);
                    return;
                }

                setIsLoading(true);
                setIsClosed(false);

                const userInCardData = await ExtensionService.getUserHeader(userCardId);

                if(!userInCardData){
                    setError("Error in getting user");
                    return;
                }

                setUserInCard(userInCardData);

                let clubId = club_id;

                if(!club_id && event_id)
                    clubId = await getClubIDFromEvent();

                const request = await getClubRequest(clubId);

                if(!request)
                    await getClubMember(clubId);

                await getUserClubMember(clubId);
                await getUserHost();
                await getPlayer();
                await getHost();

                setIsLoading(false);
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
            }
        }

        async function getClubIDFromEvent(){
            try{
                if(!event_id)
                    return null;

                const event = await ExtensionService.getEvent(event_id);

                if(!event)
                    return null;

                return event.club?.id ? event.club.id : null;
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
                return null;
            }
        }

        async function getClubRequest(clubId: string | null){
            try{
                if(!clubId || !userCardId)
                    return;

                const clubReq = await ExtensionService.getUserClubRequest(userCardId, clubId);

                setUserClubRequests(clubReq ?? null);
                return clubReq
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
            }
        }

        async function getClubMember(clubId: string | null){
            try{
                if(!clubId || !userCardId)
                    return;
                
                const clubMember = await ExtensionService.getBasicClubMember(clubId, userCardId);

                setClubMember(clubMember ?? null);
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false); 
            }
        }

        async function getUserClubMember(clubId: string | null){
            try{
                if(!userHeader || !clubId)
                    return;

                const userMember = await ExtensionService.getBasicClubMember(clubId, userHeader.id);

                setUserClubMember(userMember ?? null);
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
            }
        }

        async function getPlayer(){
            try{
                if(!userCardId || !event_id)
                    return;

                const player = await ExtensionService.getPlayer(event_id, userCardId);

                setPlayer(player ?? null);
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
            }
        }

        async function getHost(){
            try{
                if(!event_id || !userCardId)
                    return
                
                const host = await ExtensionService.getHost(event_id, userCardId);
                const event = await ExtensionService.getEvent(event_id);

                setIsCardHost(host !== null);
                setEventSeriesId(event.series_id ?? null);
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
            }
        }

        async function getUserHost(){
            try{
                if(!event_id || !userHeader)
                    return
                
                const host = await ExtensionService.getHost(event_id, userHeader.id);
                setIsUserHost(host !== null);
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
            }
        }
    }, [userCardId, userHeader, club_id]);

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error }/>;
    else
        content = <>
            <div className="profile-header">
                <img 
                    className="profile-card-profile-pic"
                    src={ userInCard?.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }
                />
                <div className="headers-cont">
                    <h3 className="username">{ userInCard?.username }</h3>
                    { clubMember &&
                        <div className="additional-info">
                            <h5 className="role">{ clubMember.role }</h5>
                            <p className="attribute-tag secondary">{ capitalizeWords(clubMember.level) }</p>
                        </div>
                    }
                </div>
            </div>
            <Button
                onBtnClick={ () => navigate(`/user/${userCardId || "guest"}`) }
                content="More Info"
            />
            { (isUserHost || userClubMember?.role === Role.OWNER) && 
                <>
                { isCardHost
                    ? <>
                        <Button 
                            content="Remove Host"
                            onBtnClick={() => removeHost() }
                            additionalClasses="red"
                        />
                        { eventSeriesId &&
                            <Button 
                                content="Remove Host from all future events"
                                onBtnClick={ () => removeHostSeries() }
                                additionalClasses="red"
                            />
                        }
                    </>
                    : <Button 
                        content="Add Host"
                        onBtnClick={ () => addHost() }
                    />
                }
                { player && (player.approved === false
                    ? <>
                        <Button
                            onBtnClick={ () => approvePlayer(true) }
                            content="Approve Event Request"
                        />
                        <Button 
                            onBtnClick={ () => approvePlayer(false) }
                            content="Deny Event Request"
                            additionalClasses="red"
                        />
                    </>
                    : <Button 
                            onBtnClick={ () => removePlayer() }
                            content="Remove Player"
                            additionalClasses="red"
                    />)
                }
                </>
            }
            { (userClubMember?.role === Role.OWNER || userClubMember?.role === Role.ADMIN) &&
                <>
                { clubRequest &&
                    <div className="request-cont">
                        <Button
                            onBtnClick={ () => approveUserRequest() }
                            content="Approve"
                        />
                        <Button
                            onBtnClick={ () => denyUserRequest() }
                            content="Deny"
                            additionalClasses="red"
                        />
                    </div>
                }
                { !clubMember?.is_level_approved && clubMember?.level !== Level.UNSET && clubMember?.level &&
                    <Button 
                        onBtnClick={ () => approveLevel(true) }
                        content="Approve Level"
                    />
                }
                { userClubMember?.role === Role.OWNER && clubMember?.role === Role.ADMIN &&
                    <> 
                        <Button 
                            onBtnClick={ () => demoteAdmin() }
                            content="Demote Admin"
                            additionalClasses="red"
                        />
                        <Button
                            onBtnClick={ () => kickMember() }
                            additionalClasses="red"
                            content="Kick Admin"
                        />
                    </>
                }
                { clubMember?.role === Role.MEMBER &&
                    <>
                        <Button
                            onBtnClick={ () => setAdmin() }
                            content="Set to Admin"
                        />
                        <Button 
                            onBtnClick={ () => kickMember() }
                            additionalClasses="red"
                            content="Kick Member"
                        />
                    </>
                }
                </>
            }
        </>

    return (
        <div className="popup user-card">
            <CloseButton setIsClosed={ closeCardPopup }/>
            { content }
        </div>
    );
}