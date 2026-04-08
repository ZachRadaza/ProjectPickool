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
    }, [searchParams.get("club")]);

    useEffect(() => {
        const userCardId = searchParams.get("previewuser");
        setPreviewUserId(userCardId);
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
            <div className="site-cont">
                <Header userHeader={ userHeader }/>
                <main>
                    <Outlet context={{ userHeader, setClosedSignIn, setClosedSignUp, setClosedModifyClub, setClosedEditUser }}/>
                </main>
                <Footer />
            </div>
        </>
    );
}