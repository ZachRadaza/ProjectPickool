import type { UserHeader, Users } from "../utils/schemas";
import { useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import "./User.css";
import { ExtensionService } from "../utils/ExtensionService";
import Loading from "./Loading";
import ErrorPage from "./Error";
import NoUserOverlay from "../components/ui/NoUserOverlay";
import EditButton from "../components/ui/buttons/EditButton";
import UserTabClubsComp from "../components/pages/user/UserTabClubsComp";
import UserTabPostsComp from "../components/pages/user/UserTabPostsComp";
import Button from "../components/ui/buttons/Button";

export const TabType = {
    CLUBS: "clubs",
    POSTS: "posts"
} as const;

export type TabType = (typeof TabType)[keyof typeof TabType];

type UserContext = {
    userHeader: UserHeader | null;
    previewUserId: string | null;
    setClosedSignUp: (closed: boolean) => void;
    setClosedSignIn: (closed: boolean) => void;
    setClosedEditUser: (closed: boolean) => void;
};

export default function User(){
    const {
        userHeader,
        setClosedSignIn,
        setClosedSignUp,
        setClosedEditUser
    } = useOutletContext<UserContext>();
    const { id } = useParams();

    const [openedUser, setOpenedUser] = useState<Users | null>(null);
    const [currentTab, setCurrentTab] = useState<TabType>(TabType.CLUBS);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

    const tabMap = {
        [TabType.CLUBS]: <UserTabClubsComp user={ openedUser } />,
        [TabType.POSTS]: <UserTabPostsComp />,
    };

    const isSelf = useMemo(() => {
        return userHeader?.id === openedUser?.id;
    }, [openedUser]); 

    function tabClasses(tab: TabType){
        return `bg ${tab === currentTab ? "active" : "" }`;
    }

    async function logoutClicked(){
        setIsLoggingOut(true);

        await ExtensionService.logoutUser();

        setIsLoggingOut(false);

        window.location.reload();
    }

    useEffect(() => {
        getUserOpened();

        async function getUserOpened(){
            try{
                setIsLoading(true);
                if(id?.trim() === "guest" || !id){
                    setIsLoading(false);
                    return;
                }

                const data = await ExtensionService.getUser(id);

                if(!data){
                    setIsLoading(false);
                    setError("Please Contact Support");
                    return;
                }

                setOpenedUser(data);
                setIsLoading(false);
            } catch(errors){
                setError("Please Contact Support");
                setIsLoading(false);
            }
        }
    }, [id]);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error }/>

    return (
        <div className="user-page">
            { !userHeader
                ? <NoUserOverlay setClosedSignIn={ setClosedSignIn } setClosedSignUp={ setClosedSignUp } />
                : <></>
            }
            <div className="user-info-cont">
                { isSelf 
                    ? <EditButton onBtnClick={ () => setClosedEditUser(false) } />
                    : <></>
                }
                <div className="content">
                    <img 
                        className="profile-pic" 
                        src={ openedUser?.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }
                    />
                    <h4 className="username">{ openedUser?.username }</h4>
                    <p className="desc">{ openedUser?.description }</p>
                    <div className="side-content">
                    </div>
                </div>
                { isSelf 
                    ? <Button content={ !isLoggingOut ? "Log Out" : "Loggin Out" } onBtnClick={ logoutClicked }/> : <></>
                }
            </div>
            <div className="user-content-cont">
                <div className="tabs">
                    <Button 
                        onBtnClick={ () => setCurrentTab(TabType.CLUBS) }
                        content="Clubs"
                        additionalClasses={ tabClasses(TabType.CLUBS) }
                    />
                    <Button
                        onBtnClick={ () => setCurrentTab(TabType.POSTS) }
                        content="Posts"
                        additionalClasses={ tabClasses(TabType.POSTS) }                   
                    />
                </div>
                <div className="content">
                    { currentTab ? tabMap[currentTab] : null }
                </div>
            </div>
        </div>
    );
}