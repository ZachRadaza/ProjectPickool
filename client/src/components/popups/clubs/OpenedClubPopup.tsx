import { useEffect, useState } from "react";
import CloseButton from "../../ui/buttons/CloseButton";
import { Role, type Club_Members, type Clubs, type Users } from "../../../utils/schemas";
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

export const TabType = {
    EVENTS: "events",
    POSTS: "posts",
    MEMBERS: "members",
} as const;

export type TabType = (typeof TabType)[keyof typeof TabType];

type  OpenedClubPopupProp= {
    user: Users | null;
    club_id: string | null;
    isClosed: boolean;
    setIsClosed: (closed: boolean) => void;
    setIsEditClubClosed: (close: boolean) => void;
};

export default function OpenedClubPopup({ user, club_id, isClosed, setIsClosed, setIsEditClubClosed }: OpenedClubPopupProp){
    const [club, setClub] = useState<Clubs | null>(null);
    const [currentTab, setCurrentTab] = useState<TabType>(TabType.EVENTS);
    const [userClubRole, setUserClubRole] = useState<Role | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const tabMap = {
        [TabType.EVENTS]: <ClubEventsComp />,
        [TabType.POSTS]: <ClubPostsComp />,
        [TabType.MEMBERS]: <ClubMembersComp club_id={ club_id } />
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

    function deleteClubBtn(){

    }

    useEffect(() => {
        setIsLoading(true);
        setError(null);
    }, [isClosed]);

    useEffect(() => {
        getClub();
        getUserClubMember();

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

        async function getUserClubMember(){
            try{
                if(!user || !club_id){
                    setIsLoading(false);
                    setUserClubRole(null);
                    return;
                }

                setIsLoading(true);

                const userClubMember: Club_Members = await ExtensionService.getSingleClubMember(club_id, user.id!);

                if(!userClubMember){
                    setIsLoading(false);
                    setIsClosed(true);
                }

                const role: Role = userClubMember.role;

                setUserClubRole(role);
                setIsLoading(false);
            } catch(error){
                setError("Error occured in opening club");
                setIsLoading(false);
            }
        }
    }, [club_id, user]);

    if(isLoading)
        content = <Loading />
    else if(error)
        content = <ErrorPage error={ error } />
    else 
        content = (
        <>
            <CloseButton setIsClosed={ closeClubPopup } />
            <div className="banner">
                <img
                    src={ club?.banner ?? import.meta.env.VITE_DEFAULT_CLUB_BANNER }
                    alt="Club banner"
                />
            </div>
            <div className="content width-bound">
                { (userClubRole === Role.OWNER || userClubRole === Role.ADMIN) 
                    ? <div className="modify-club-cont">
                        <EditButton action={ editClubBtn } />
                        <DeleteButton action={ deleteClubBtn } />
                    </div> 
                    : <></>
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
                </div>
            </div>
            <div className="club-tab-cont width-bound">
                <div className="tabs">
                    <button
                        onClick={() => setCurrentTab(TabType.EVENTS) }
                    >
                        Events
                    </button>
                    <button
                        onClick={() => setCurrentTab(TabType.POSTS) }
                    >
                        Posts
                    </button>
                    <button
                        onClick={() => setCurrentTab(TabType.MEMBERS) }
                    >
                        Members
                    </button>
                </div>
                <div className="tab-content">
                    { currentTab ? tabMap[currentTab] : null }
                </div>
            </div>
        </>
        );


    return (
        <div className="container">
            <div className={`popup opened-club ${isClosed ? "closed" : ""}`}>
                { content }
            </div>
        </div>
    );
}