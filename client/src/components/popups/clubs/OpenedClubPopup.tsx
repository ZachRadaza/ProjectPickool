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
};

export default function OpenedClubPopup({ userHeader, club_id, isClosed, setIsClosed, setIsEditClubClosed, setIsSignUpClosed }: OpenedClubPopupProp){
    const [club, setClub] = useState<Clubs | null>(null);
    const [currentTab, setCurrentTab] = useState<TabType>(TabType.EVENTS);
    const [userClubMember, setUserClubMember] = useState<Club_Members | null>(null);
    const [requested, setRequested] = useState<boolean>(false);
    const [numRequests, setNumRequests] = useState<number>(0);

    const [moreOptions, setMoreOptions] = useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const tabMap = {
        [TabType.EVENTS]: <ClubEventsComp />,
        [TabType.POSTS]: <ClubPostsComp />,
        [TabType.MEMBERS]: <ClubMembersComp club_id={ club_id } />,
        [TabType.REQUESTS]: <ClubRequestsComp club_id={ club_id } setNumRequests={ setNumRequests }/>,
        [TabType.LEVEL]: <ClubLevelComp userHeader={ userHeader } userClubMember={ userClubMember } club_id={ club_id }/>
    };

    const navigate = useNavigate();
    const location = useLocation();

    let content;

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

    useEffect(() => {
        getClub();

        async function getClub(){
            try{
                if(!club_id){
                    setIsClosed(true);
                    return;
                }

                setIsLoading(true);
                setIsClosed(false);

                const data: Clubs = await ExtensionService.getClub(club_id);

                if(!data){
                    setError("Error occured in opening club");
                    setIsLoading(false);
                }

                setClub(data);

                setIsLoading(false);
            } catch(error){
                setError("Error occured in opening club");
                setIsLoading(false);
            }
        }
    }, [club_id]);

    if(isLoading)
        content = <Loading />
    else if(error)
        content = <ErrorPage error={ error } />
    else 
        content = <>
            <CloseButton setIsClosed={ closeClubPopup } />
            <div
                className="more-options ui"
                onClick={ () => setMoreOptions(!moreOptions) }
            >
                More
                { moreOptions &&
                    <div className="more-options-content">
                        <button
                            onClick={ () => navigator.clipboard.writeText(window.location.href) }
                        >
                            Copy Club Links
                        </button>
                        <button>Report Club</button>
                        { userClubMember?.role !== Role.OWNER &&
                            <button
                                onClick={ () => leaveClub() }
                            >Leave Club</button>
                        }
                    </div>
                }
            </div>
            <div className="banner">
                <img
                    src={ club?.banner ?? import.meta.env.VITE_DEFAULT_CLUB_BANNER }
                    alt="Club banner"
                />
            </div>
            <div className="content width-bound">
                { (userClubMember?.role === Role.OWNER || userClubMember?.role === Role.ADMIN) &&
                    <div className="modify-club-cont">
                        <EditButton action={ editClubBtn } />
                        <DeleteButton action={ deleteClubBtn } />
                    </div> 
                }
                <img 
                    className="profile-pic"
                    src={ club?.profile_pic ?? import.meta.env.VITE_DEFAULT_CLUB_PIC }
                    alt="Club Profile Picture"
                />
                <div className="headers">
                    <h3 className="club-name">{ club ? club.name : "na" }</h3>
                    <div className="club-attributes">
                        <h6>{ club?.is_public ? "Public" : "Private" }</h6>
                        <h6>{ club?.level }</h6>
                    </div>
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
                    <button onClick={ () => setCurrentTab(TabType.EVENTS) }>
                        Events
                    </button>
                    <button onClick={ () => setCurrentTab(TabType.POSTS) }>
                        Posts
                    </button>
                    <button onClick={ () => setCurrentTab(TabType.MEMBERS) }>
                        Members
                    </button>
                    { (userClubMember?.role === Role.OWNER || userClubMember?.role === Role.ADMIN) &&
                        <button onClick={ () => setCurrentTab(TabType.REQUESTS) }>
                            Requests ({ numRequests })
                        </button>
                    }
                    { userClubMember?.role &&
                        <button onClick={ () => setCurrentTab(TabType.LEVEL) }>
                            Club Level
                        </button>
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