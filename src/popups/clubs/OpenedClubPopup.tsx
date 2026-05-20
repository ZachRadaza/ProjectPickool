import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import CloseButton from "../../components/ui/buttons/CloseButton";
import { Role, type Club_Members, type Club_Requests, type Clubs, type UserHeader } from "../../utils/schemas";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import { ExtensionService } from "../../utils/ExtensionService";
import { useNavigate, useLocation } from "react-router-dom";
import ClubEventsComp from "../../components/clubs/ClubEventsComp";
import ClubPostsComp from "../../components/clubs/ClubPostsComp";
import ClubMembersComp from "../../components/clubs/ClubMembersComp";
import "./OpenedClubPopup.css";
import EditButton from "../../components/ui/buttons/EditButton";
import DeleteButton from "../../components/ui/buttons/DeleteButton";
import "../popup.css";
import ClubRequestsComp from "../../components/clubs/ClubRequestsComp";
import ClubLevelComp from "../../components/clubs/ClubLevelComp";
import MoreButton from "../../components/ui/buttons/MoreButton";
import Button from "../../components/ui/buttons/Button";
import { capitalizeWords } from "../../utils/random";
import FavoriteButton from "../../components/ui/buttons/FavoriteButton";
import ClubInfoComp from "../../components/clubs/ClubInfoComp";

export const TabType = {
    EVENTS: "events",
    POSTS: "posts",
    MEMBERS: "members",
    REQUESTS: "requests",
    LEVEL: "level",
    INFO: "info"
} as const;

export type TabType = (typeof TabType)[keyof typeof TabType];

type  OpenedClubPopupProp= {
    userHeader: UserHeader | null;
    club_id: string | null;
    setIsClosed: (closed: boolean) => void;
    setIsEditClubClosed: (close: boolean) => void;
    setIsModifyEventClosed: (close: boolean) => void;
    setClosedNoUserPopup: Dispatch<SetStateAction<boolean>>;
};

export default function OpenedClubPopup({ 
    userHeader, 
    club_id, 
    setIsClosed, 
    setIsEditClubClosed, 
    setIsModifyEventClosed,
    setClosedNoUserPopup
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
        [TabType.LEVEL]: <ClubLevelComp userHeader={ userHeader } userClubMember={ userClubMember } club_id={ club_id } setUserClubMember={ setUserClubMember }/>,
        [TabType.INFO]: <ClubInfoComp club={ club } editClubBtn={ editClubBtn } deleteClubBtn={ deleteClubBtn }/>
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
        const fav = await ExtensionService.ClubMemberService.updateClubMember(club_id, userHeader?.id, { is_favorite });

        if(!fav){
            setError("Error in Favoriting Club");
        }
    }

    async function leaveClub(){
        if(!club_id || !userHeader?.id)
            return;

        const left = await ExtensionService.ClubMemberService.deleteClubMember(club_id, userHeader.id);

        if(!left)
            setError("Error in Leaving Club");

        closeClubPopup(true);
    }

    async function deleteClubBtn(){
        if(!club_id || !userHeader?.id)
            return;

        const deleted = await ExtensionService.ClubService.deleteClub(club_id);

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
            setClosedNoUserPopup(false);
            return;
        } 
          
        let attemptJoin;
        if(club?.is_public){
            attemptJoin = await ExtensionService.ClubMemberService.addClubMember(club_id, userHeader.id, false);
        } else
            attemptJoin = await ExtensionService.ClubRequestService.addClubRequests(club_id, userHeader.id);

        if(!attemptJoin)
            setError("error in joining club");

        setRequested(true);
    }

    useEffect(() => {
        getUserClubMember();

        async function getUserClubMember(){
            try{
                if(!club_id){
                    setUserClubMember(null);
                    setIsLoading(false);
                    return;
                }

                await getClub();

                const userClubMember: Club_Members | null = userHeader 
                    ? await ExtensionService.ClubMemberService.getSingleClubMember(club_id, userHeader.id)
                    : null;

                if(!userClubMember && userHeader){
                    setUserClubMember(null);
                    await getUserClubRequest(userHeader.id!, club_id);
                    setIsLoading(false);

                    return;
                } else if(userClubMember?.role !== Role.MEMBER)
                    await getRequestNum(club_id);

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

            const data: Clubs | null = await ExtensionService.ClubService.getClub(club_id);

            if(!data){
                setError("Error occured in opening club");
                setIsLoading(false);
            }
            setClub(data);
        }

        async function getRequestNum(club_id: string){
            const reqs = await ExtensionService.ClubRequestService.getNumClubRequests(club_id);

            if(reqs)
                setNumRequests(reqs);
        }

        async function getUserClubRequest(user_id: string, club_id: string){
            const userRequested: Club_Requests | null = await ExtensionService.ClubRequestService.getUserClubRequest(user_id, club_id);

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
                    { userClubMember === null &&
                        <Button 
                            content={ requested ? "Requested" : "Join Club" }
                            additionalClasses="join-club-btn club-action-btn"
                            onBtnClick={ () => joinClub() }
                            isDisabled={ requested ? true : false }
                        />
                    }
                </div>
            </div>
            <div className="club-tab-cont width-bound">
                <div className="tabs club-tabs">
                    <Button
                        onBtnClick={ () => setCurrentTab(TabType.EVENTS) }
                        content="Events"
                        additionalClasses={ tabClasses(TabType.EVENTS) }
                    />
                    {/*
                    <Button
                        onBtnClick={ () => setCurrentTab(TabType.POSTS) }
                        content="Posts"
                        additionalClasses={ tabClasses(TabType.POSTS) }
                    />
                    */}
                    <Button
                        onBtnClick={ () => setCurrentTab(TabType.MEMBERS) }
                        content="Members"
                        additionalClasses={ tabClasses(TabType.MEMBERS) }
                    />
                    <Button 
                        onBtnClick={ () => setCurrentTab(TabType.INFO) }
                        content="Info"
                        additionalClasses={ tabClasses(TabType.INFO) }
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
        <div className="popup opened-club max-width">
            { content }
        </div>
    );
}