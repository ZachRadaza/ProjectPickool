import { useEffect, useState } from "react";
import CloseButton from "../../ui/buttons/CloseButton";
import { Role, type Club_Members, type Club_Requests, type Clubs, type UserHeader } from "../../../utils/schemas";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import { ExtensionService } from "../../../utils/ExtensionService";
import { useNavigate, useLocation } from "react-router-dom";
import ClubEventsComp from "../../pages/clubs/ClubEventsComp";
import ClubPostsComp from "../../pages/clubs/ClubPostsComp";
import ClubMembersComp from "../../pages/clubs/ClubMembersComp";
import "./OpenedClubPopup.css";
import EditButton from "../../ui/buttons/EditButton";
import DeleteButton from "../../ui/buttons/DeleteButton";
import "../popup.css";
import ClubRequestsComp from "../../pages/clubs/ClubRequestsComp";
import ClubLevelComp from "../../pages/clubs/ClubLevelComp";
import MoreButton from "../../ui/buttons/MoreButton";
import Button from "../../ui/buttons/Button";
import { capitalizeWords } from "../../../utils/random";
import FavoriteButton from "../../ui/buttons/FavoriteButton";
import LocationIconComp from "../../ui/icons/LocationIconComp";

export const TabType = {
    EVENTS: "events",
    POSTS: "posts",
    MEMBERS: "members",
    REQUESTS: "requests",
    LEVEL: "level"
} as const;

export type TabType = (typeof TabType)[keyof typeof TabType];

type  OpenedClubPopupProp= {
    userHeader: UserHeader | null;
    club_id: string | null;
    isClosed: boolean;
    setIsClosed: (closed: boolean) => void;
    setIsEditClubClosed: (close: boolean) => void;
    setIsSignUpClosed: (close: boolean) => void;
    setIsModifyEventClosed: (close: boolean) => void;
};

export default function OpenedClubPopup({ 
    userHeader, 
    club_id, 
    isClosed, 
    setIsClosed, 
    setIsEditClubClosed, 
    setIsSignUpClosed, 
    setIsModifyEventClosed 
}: OpenedClubPopupProp){
    const [club, setClub] = useState<Clubs | null>(null);
    const [currentTab, setCurrentTab] = useState<TabType>(TabType.EVENTS);
    const [userClubMember, setUserClubMember] = useState<Club_Members | null>(null);
    const [requested, setRequested] = useState<boolean>(false);
    const [numRequests, setNumRequests] = useState<number>(0);

    const [moreOptions, setMoreOptions] = useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const tabMap = {
        [TabType.EVENTS]: <ClubEventsComp club_id={ club_id } setClosedModifyEvent={ setIsModifyEventClosed } userClubMember={ userClubMember }/>,
        [TabType.POSTS]: <ClubPostsComp />,
        [TabType.MEMBERS]: <ClubMembersComp club_id={ club_id } />,
        [TabType.REQUESTS]: <ClubRequestsComp club_id={ club_id } setNumRequests={ setNumRequests }/>,
        [TabType.LEVEL]: <ClubLevelComp userHeader={ userHeader } userClubMember={ userClubMember } club_id={ club_id } setUserClubMember={ setUserClubMember }/>
    };

    const navigate = useNavigate();
    const location = useLocation();

    let content;

    function tabClasses(tabType: TabType){
        return `bg ${tabType === currentTab ? "active" : ""}`;
    }

    function closeClubPopup(closed: boolean){
        setIsClosed(closed);

        const params = new URLSearchParams(location.search);
        params.delete("club");

        navigate({
            pathname: location.pathname,
            search: params.toString(),
        });
    }

    function editClubBtn(){
        setIsEditClubClosed(false);
    }

    async function favoriteClubBtn(){
        if(!club_id || !userHeader?.id)
            return;

        const is_favorite = !userClubMember?.is_favorite;

        setUserClubMember((prev) => prev ? {...prev, is_favorite } : prev);
        const fav = await ExtensionService.updateClubMember(club_id, userHeader?.id, { is_favorite });

        if(!fav){
            setError("Error in Favoriting Club");
        }
    }

    async function leaveClub(){
        if(!club_id || !userHeader?.id)
            return;

        const left = await ExtensionService.deleteClubMember(club_id, userHeader.id);

        if(!left)
            setError("Error in Leaving Club");

        closeClubPopup(true);
    }

    async function deleteClubBtn(){
        if(!club_id || !userHeader?.id)
            return;

        const deleted = await ExtensionService.deleteClub(club_id, userHeader.id);

        if(deleted){
            setIsClosed(true);
            navigate("/clubs");
            window.location.reload();
        } else {
            setError("Error in deleting club");
        }
    }

    async function joinClub(){
        if(!club_id)
            return;

        if(!userHeader?.id){
            setIsSignUpClosed(false);
            return;
        } 
          
        let attemptJoin;
        if(club?.is_public){
            attemptJoin = await ExtensionService.addClubMember(club_id, userHeader.id);
        } else
            attemptJoin = await ExtensionService.addClubRequests(club_id, userHeader.id);

        if(!attemptJoin)
            setError("error in joining club");

        setRequested(true);
    }

    useEffect(() => {
        if(isClosed) return;
        setIsLoading(true);
        setError(null);
        setCurrentTab(TabType.EVENTS);
    }, [isClosed]);

    useEffect(() => {
        getUserClubMember();

        async function getUserClubMember(){
            try{
                if(!userHeader || !club_id){
                    setUserClubMember(null);
                    return;
                }

                setIsLoading(true);

                await getClub();

                const userClubMember: Club_Members = await ExtensionService.getSingleClubMember(club_id, userHeader.id);

                if(!userClubMember){
                    setUserClubMember(null);
                    await getUserClubRequest(userHeader.id!, club_id);
                    setIsLoading(false);

                    return;
                } else if(userClubMember.role !== Role.MEMBER){
                    await getRequestNum(club_id);
                }

                setRequested(false);
                setUserClubMember(userClubMember);
                setIsLoading(false);
            } catch(error){
                setError("Error occured in opening club");
                setIsLoading(false);
            }
        }
        
        async function getClub(){
            if(!club_id)
                return;

            setIsClosed(false);

            const data: Clubs = await ExtensionService.getClub(club_id);

            if(!data){
                setError("Error occured in opening club");
                setIsLoading(false);
            }
            setClub(data);
        }

        async function getRequestNum(club_id: string){
            const reqs = await ExtensionService.getNumClubRequests(club_id);

            if(reqs)
                setNumRequests(reqs);
        }

        async function getUserClubRequest(user_id: string, club_id: string){
            const userRequested: Club_Requests = await ExtensionService.getUserClubRequest(user_id, club_id);

            if(userRequested)
                setRequested(true);
        }
    }, [requested, userHeader, club_id]);

    if(isLoading)
        content = <Loading />
    else if(error)
        content = <ErrorPage error={ error } />
    else 
        content = <>
            <div className="top-right-cont">
                <div className="more-cont">
                    <MoreButton onBtnClick={ () => setMoreOptions(!moreOptions) }/>
                    { moreOptions &&
                        <div className="more-options-content">
                            <Button 
                                onBtnClick={ () => navigator.clipboard.writeText(window.location.href) }
                                content="Copy Club Links"
                            />
                            <Button
                                onBtnClick={ () => leaveClub() }
                                additionalClasses="red"
                                content="Leave Club"
                            />
                        </div>
                    }
                </div>
                <CloseButton setIsClosed={ closeClubPopup } />
            </div>
            <div className="banner">
                <img
                    src={ club?.banner ?? import.meta.env.VITE_DEFAULT_CLUB_BANNER }
                    alt="Club banner"
                />
            </div>
            <div className="content width-bound">
                <div className="modify-club-cont">
                    { (userClubMember?.role === Role.OWNER || userClubMember?.role === Role.ADMIN) &&
                        <>
                            <DeleteButton onBtnClick={ deleteClubBtn } />
                            <EditButton onBtnClick={ editClubBtn } />
                        </>
                    }
                    { userClubMember &&
                        <FavoriteButton
                            onBtnClick={ () => favoriteClubBtn() }
                            isFavorite={ userClubMember.is_favorite }
                        />
                    }
                </div> 
                <img 
                    className="profile-pic"
                    src={ club?.profile_pic ?? import.meta.env.VITE_DEFAULT_CLUB_PIC }
                    alt="Club Profile Picture"
                />
                <div className="headers">
                    <h3 className="club-name">{ club ? club.name : "na" }</h3>
                    <div className="club-attributes">
                        <p className="attribute-tag secondary">{ club?.is_public ? "Public" : "Private" }</p>
                        <p className="attribute-tag secondary">{ capitalizeWords(club?.level) }</p>
                    </div>
                    <LocationIconComp location={ club?.location ?? null } />
                    <p className="desc">
                        { club?.description }
                    </p>
                    { userClubMember === null &&
                        <button
                            className="join-club-btn club-action-btn"
                            onClick={ () => joinClub() }
                            disabled={ requested ? true : false }
                        >
                            { requested ? "Requested" : "Join Club" }
                        </button>
                    }
                </div>
            </div>
            <div className="club-tab-cont width-bound">
                <div className="tabs">
                    <Button
                        onBtnClick={ () => setCurrentTab(TabType.EVENTS) }
                        content="Events"
                        additionalClasses={ tabClasses(TabType.EVENTS) }
                    />
                    <Button
                        onBtnClick={ () => setCurrentTab(TabType.POSTS) }
                        content="Posts"
                        additionalClasses={ tabClasses(TabType.POSTS) }
                    />
                    <Button
                        onBtnClick={ () => setCurrentTab(TabType.MEMBERS) }
                        content="Members"
                        additionalClasses={ tabClasses(TabType.MEMBERS) }
                    />
                    { (userClubMember?.role === Role.OWNER || userClubMember?.role === Role.ADMIN) &&
                        <Button
                            onBtnClick={ () => setCurrentTab(TabType.REQUESTS) }
                            content={ `Requests (${numRequests})` }
                            additionalClasses={ tabClasses(TabType.REQUESTS) }              
                        />
                    }
                    { userClubMember?.role &&
                        <Button
                            onBtnClick={ () => setCurrentTab(TabType.LEVEL) }
                            content="Club Level"
                            additionalClasses={ tabClasses(TabType.LEVEL) }
                        />
                    }
                </div>
                <div className="tab-content">
                    { currentTab ? tabMap[currentTab] : null }
                </div>
            </div>
        </>;

    return (
        <div className="container">
            <div className={`popup opened-club ${isClosed ? "closed" : ""}`}>
                { content }
            </div>
        </div>
    );
}