import { Outlet, useSearchParams } from "react-router-dom";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import SignUpPopup from "../components/popups/user/SignUpPopup";
import SignInPopup from "../components/popups/user/SignInPopup";
import { useState, useEffect } from "react";
import type { UserHeader } from "../utils/schemas";
import { ExtensionService } from "../utils/ExtensionService";
import Loading from "../pages/Loading";
import ErrorPage from "../pages/Error";
import OpenedClubPopup from "../components/popups/clubs/OpenedClubPopup";
import ModifyClubPopup from "../components/popups/clubs/ModifyClubPopup";
import UserCardPopup from "../components/popups/user/UserCardPopup";
import EditUserPopup from "../components/popups/user/EditUserPopup";

export default function Layout(){
    const [closedSignIn, setClosedSignIn] = useState<boolean>(true);
    const [closedSignUp, setClosedSignUp] = useState<boolean>(true);
    const [closedModifyClub, setClosedModifyClub] = useState<boolean>(true);
    const [closedOpenedClub, setClosedOpenedClub] = useState<boolean>(true);
    const [closedUserCard, setClosedUserCard] = useState<boolean>(true);
    const [closedEditUser, setClosedEditUser] = useState<boolean>(true);

    const [userHeader, setUserHeader] = useState<UserHeader | null>(null);
    const [club_id, setClubId] = useState<string | null>(null);
    const [previewUserId, setPreviewUserId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        getCurrentUser();

        async function getCurrentUser(){
            try{
                setIsLoading(true);
                
                const userFetch = await ExtensionService.getCurrentUser();

                if(userFetch)
                    setUserHeader(userFetch);

                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Please Contact Support");
            }
        }
    }, []);

    useEffect(() => {
        const club = searchParams.get("club");
        setClubId(club);

        if(!club)
            setClosedOpenedClub(true);
    }, [searchParams.get("club")]);

    useEffect(() => {
        const userCardId = searchParams.get("previewuser");
        setPreviewUserId(userCardId);

        if(!userCardId)
            setClosedUserCard(true);
    }, [searchParams.get("previewuser")]);

    if(isLoading)
        return <Loading />

    if(error)
        return <ErrorPage error={ error }/>

    return (
        <>
            <div className="popups-cont">
                <OpenedClubPopup 
                    isClosed={ closedOpenedClub } 
                    setIsClosed={ setClosedOpenedClub } 
                    club_id={ club_id } 
                    userHeader={ userHeader }
                    setIsEditClubClosed={ setClosedModifyClub }
                    setIsSignUpClosed={ setClosedSignUp }
                />
                <ModifyClubPopup 
                    isClosed={ closedModifyClub } 
                    setIsClosed={ setClosedModifyClub } 
                    userHeader={ userHeader } 
                    isEditing={ !closedOpenedClub }
                    club_id={ club_id }
                />
                <UserCardPopup 
                    isClosed={ closedUserCard } 
                    setIsClosed={ setClosedUserCard } 
                    userHeader={ userHeader } 
                    userCardId={ previewUserId }
                    club_id={ club_id }
                />
                <EditUserPopup
                    isClosed={ closedEditUser }
                    setIsClosed={ setClosedEditUser }
                    userHeader={ userHeader }
                    setUserHeader={ setUserHeader }
                />
                <SignInPopup isClosed={ closedSignIn } setIsClosed={ setClosedSignIn }/>
                <SignUpPopup isClosed={ closedSignUp } setIsClosed={ setClosedSignUp }/>
            </div>
            <main>
                <Header userHeader={ userHeader }/>
                <svg className="bg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 125" fill="none">
                    <g fill="currentColor">
                        <path d="M93.5,89.8l-2.8-3.4c-1.2-1.5-1.6-1.7-1.8-1.7c-0.2-0.1-0.6-0.6-1.3-1.3l-9-10.4c-0.6-0.7-0.7-1.4-0.7-1.5c0.7-0.6,0.4-1.8-0.6-3L76,66.9c-0.3-0.4-0.8-0.7-1.3-0.8c-0.5-1.1-1.3-3.9-0.1-8.8c0.1-0.4,2.8-9.8,3-12.8c0.1-0.7,1.2-7.4-5-15.8L55.8,8.4C55.6,8.2,50.7,2.5,43,2.5c-4.4,0-8.7,1.8-13,5.5l-8.2,7.1l-0.6,0.6l-8.1,7.1c-4.6,4.1-7,8.6-7.3,13.3c-0.4,7,4.1,12.1,4.3,12.3L28,67.8c6.7,6.5,13,7,14.7,7c0.2,0,0.3,0,0.3,0c2.9,0.2,12.7-1.2,13-1.2c0.8-0.1,1.6-0.1,2.3-0.1c3.7,0,5.7,1,6.5,1.5c0.1,0.4,0.3,0.8,0.6,1.2l1.5,1.7c1,1.1,2.3,1.5,2.9,0.9c0,0,0,0,0.1,0c0.3,0,0.9,0.3,1.3,0.9l8.9,10.4c0.6,0.7,1,1.2,1.1,1.4c0,0.3,0.4,0.8,1.5,2l3,3.3c0.5,0.5,1.2,0.9,2,0.9l0,0c0.7,0,1.3-0.2,1.8-0.7l3.7-3.2C94.3,92.6,94.5,90.9,93.5,89.8zM64.9,73.7c-1.2-0.6-3.2-1.3-6.6-1.3c-0.8,0-1.6,0-2.4,0.1c-0.1,0-10,1.5-12.9,1.2l0,0l0,0c0,0-0.1,0-0.3,0c-1.2,0-7.4-0.3-14-6.7L10.9,47.7c0,0-4.4-4.9-4-11.5c0.2-4.5,2.6-8.7,6.9-12.6l8.1-7.2l0.6-0.6l8.1-7c4.1-3.5,8.2-5.2,12.3-5.2c7.2,0,12,5.5,12,5.5l16.7,20.2c6.1,8.2,4.8,15,4.7,15l0,0.1c-0.1,2.8-2.9,12.5-2.9,12.6c-1.1,4.6-0.5,7.5,0,9c-0.5,0.1-0.9,0.3-1.3,0.6l-6.5,5.7C65.3,72.7,65,73.2,64.9,73.7zM92.5,92.8L88.9,96c-0.3,0.3-0.7,0.4-1.1,0.4c-0.5,0-0.9-0.2-1.2-0.5l-3-3.3c-0.6-0.6-1-1.1-1.1-1.4c0-0.3-0.3-0.8-1.4-2.1l-8.9-10.4c-1-1.1-2.3-1.5-2.9-1c0,0,0,0-0.1,0c-0.3,0-0.9-0.3-1.4-0.9l-1.5-1.7c-0.6-0.7-0.5-1.7,0.1-2.2l6.5-5.7c0.6-0.6,1.7-0.5,2.2,0.1l1.5,1.7c0.6,0.7,0.8,1.4,0.7,1.5c-0.7,0.7-0.3,2,0.6,3l9,10.4c1.2,1.4,1.7,1.6,1.9,1.7c0.2,0.1,0.6,0.6,1.2,1.3l2.8,3.4C93.3,91.2,93.2,92.2,92.5,92.8z"/>
                        <path d="M70.7,29.1L55.1,10.3c-0.2-0.2-4.7-5.5-11.9-5.5c-4.1,0-8.3,1.8-12.3,5.2l-7.7,6.7l-0.6,0.6l-7.6,6.7c-4.3,3.9-6.7,8.1-6.9,12.6c-0.4,6.6,3.8,11.2,4,11.4l16.6,18c6.2,6,12.1,6.5,13.7,6.5c0.2,0,0.3,0,0.3,0c0.2,0,0.4,0,0.7,0h0c3.3,0,11.2-1.2,11.6-1.3l0.5-0.1l-0.1-0.5c0-0.1-0.7-7.2,4.6-11.3c2.6-2,5.5-2.5,7.5-2.5c1.9,0,3.2,0.4,3.3,0.4l0.5,0.1l0.2-0.5c0.1-0.4,3.6-10.2,3.8-13C75.4,43.3,76.5,37,70.7,29.1zM73.2,35.8c0.4,1.2,0.7,2.3,0.9,3.3L38,70.6c-0.8-0.3-1.7-0.6-2.7-1.1L73.2,35.8zM34,68.7c-0.6-0.4-1.3-0.8-2-1.3l39.6-35c0.4,0.7,0.8,1.4,1.1,2.1L34,68.7zM12.9,47.3c0,0-4-4.5-3.7-10.7c0.2-4.2,2.4-8.2,6.6-11.9l7.6-6.7l0.6-0.6l7.7-6.6c3.8-3.3,7.7-5,11.6-5c6.7,0,11.1,5.1,11.1,5.1l15.5,18.8c0.3,0.5,0.7,0.9,1,1.4l-40,35.3c-0.5-0.4-0.9-0.8-1.4-1.3L12.9,47.3z"/>
                    </g>
                </svg>
                <Outlet context={{ userHeader, setClosedSignIn, setClosedSignUp, setClosedModifyClub, setClosedEditUser }}/>
                <Footer />
            </main>
        </>
    );
}