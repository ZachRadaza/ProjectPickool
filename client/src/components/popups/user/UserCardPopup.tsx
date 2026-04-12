import { useEffect, useState } from "react";
import { Level, Role, type Club_Members, type Club_Members_Basic, type Club_Requests, type UserHeader } from "../../../utils/schemas";
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
    userHeader: UserHeader| null;
    isClosed: boolean;
    setIsClosed: (close: boolean) => void;
};

export default function UserCardPopup({ userHeader, userCardId, club_id, isClosed, setIsClosed }: UserCardPopupProp){
    const [userInCard, setUserInCard] = useState<UserHeader | null>(null);
    const [clubMember, setClubMember] = useState<Club_Members_Basic | null>(null);
    const [clubRequest, setUserClubRequests] = useState<Club_Requests | null>(null);
    const [userClubMember, setUserClubMember] = useState<Club_Members_Basic | null>(null);

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

    useEffect(() => {
        if(isClosed) return;
        setUserInCard(null);
        setClubMember(null);
        setUserClubRequests(null);
        setUserClubMember(null);
        setError(null);
    }, [closed]);

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
                const request = await getClubRequest();

                if(!request)
                    await getclubMember();

                await getUserClubMember();
                setIsLoading(false);
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
            }
        }

        async function getClubRequest(){
            try{
                if(!club_id || !userCardId)
                    return;

                const clubReq = await ExtensionService.getUserClubRequest(userCardId, club_id);

                setUserClubRequests(clubReq ?? null);
                return clubReq
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false);
            }
        }

        async function getclubMember(){
            try{
                if(!club_id || !userCardId)
                    return;
                
                const clubMember = await ExtensionService.getBasicClubMember(club_id, userCardId);

                setClubMember(clubMember ?? null);
            } catch(error){
                setError("Error in Fetching Profile Info");
                setIsLoading(false); 
            }
        }

        async function getUserClubMember(){
            try{
                if(!userHeader || !club_id)
                    return;

                const userMember = await ExtensionService.getBasicClubMember(club_id, userHeader.id);

                setUserClubMember(userMember ?? null);
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
                    <h4 className="username">{ userInCard?.username }</h4>
                    { clubMember &&
                        <div className="additional-info">
                            <h6>{ clubMember.role }</h6>
                            <p className="attribute-tag secondary">{ capitalizeWords(clubMember.level) }</p>
                        </div>
                    }
                </div>
            </div>
            <Button
                onBtnClick={ () => navigate(`/user/${userCardId || "guest"}`) }
                content="More Info"
            />
            { userClubMember?.role !== Role.MEMBER &&
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
        <div className="container">
            <div className={`popup user-card ${isClosed ? "closed" : ""}`}>
                <CloseButton setIsClosed={ closeCardPopup }/>
                { content }
            </div>
        </div>        
    );
}