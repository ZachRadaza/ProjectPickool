import { Outlet, useSearchParams } from "react-router-dom";
import Header from "../components/layout/header";
import Footer from "../components/layout/footer";
import SignUpPopup from "../components/popups/user/SignUpPopup";
import SignInPopup from "../components/popups/user/SignInPopup";
import { useState, useEffect } from "react";
import type { Users } from "../utils/schemas";
import { ExtensionService } from "../utils/ExtensionService";
import Loading from "../pages/Loading";
import ErrorPage from "../pages/Error";
import CreateClubPopup from "../components/popups/clubs/CreateClubPopup";
import OpenedClubPopup from "../components/popups/clubs/OpenedClubPopup";

export default function Layout(){
    const [closedSignIn, setClosedSignIn] = useState<boolean>(true);
    const [closedSignUp, setClosedSignUp] = useState<boolean>(true);
    const [closedCreateClub, setClosedCreateClub] = useState<boolean>(true);
    const [closedOpenedClub, setClosedOpenedClub] = useState<boolean>(true);

    const [user, setUser] = useState<Users | null>(null);
    const [club_id, setClubId] = useState<string | null>(null);

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
                    setUser(userFetch);

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

    async function updateUserInfo(id: string, user: Partial<Users>){
        if(!user)
            return;

        const updatedUser = await ExtensionService.updateUser(id, user);

        if(updatedUser)
            setUser(updatedUser);
    }

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
                    user={ user }
                    setIsEditClubClosed={ setClosedCreateClub }
                />
                <SignInPopup isClosed={ closedSignIn } setIsClosed={ setClosedSignIn }/>
                <SignUpPopup isClosed={ closedSignUp } setIsClosed={ setClosedSignUp }/>
                <CreateClubPopup isClosed={ closedCreateClub } setIsClosed={ setClosedCreateClub } user={ user }/>
            </div>
            <div className="site-cont">
                <Header user={ user }/>
                <main>
                    <Outlet context={{ user, setClosedSignIn, setClosedSignUp, updateUserInfo, setClosedCreateClub }}/>
                </main>
                <Footer />
            </div>
        </>
    );
}