import { useOutletContext, useNavigate } from "react-router-dom";
import { type Club_Members, type UserClubRequests, type UserClubs, type UserHeader } from "../utils/schemas";
import { useEffect, useState } from "react";
import { ExtensionService } from "../utils/ExtensionService";
import ClubsComp from "../components/ui/ClubsComp";
import Loading from "./Loading";
import ErrorPage from "./Error";
import "./Clubs.css";
import NoUserOverlay from "../components/ui/NoUserOverlay";

type ClubsContext = {
    userHeader: UserHeader | null;
    setClosedModifyClub: (close:boolean) => void;
    setClosedSignUp: (closed: boolean) => void;
    setClosedSignIn: (closed: boolean) => void;
};

export default function Clubs(){
    const { 
        userHeader, 
        setClosedModifyClub,
        setClosedSignIn,
        setClosedSignUp 
    } = useOutletContext<ClubsContext>();
    
    const [userClubs, setUserClubs] = useState<UserClubs[]>([]);
    const [userClubRequests, setUserClubRequests] = useState<UserClubRequests[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    async function changeFavorite(club_id: string, is_favorite: boolean){
        if(!userHeader)
            return;

        const updates: Partial<Club_Members> = {
            is_favorite
        };

        setUserClubs((prev) => {
            const newUserClubs = prev.map((userClub) => 
                userClub.club.id === club_id
                    ? {...userClub, is_favorite}
                    : userClub
            );

            return newUserClubs;
        });

        const data = await ExtensionService.updateClubMember(club_id, userHeader.id, updates);

        if(!data)
            setError("Error is setting favorite");
    }

    useEffect(() => {
        getUserClubs();

        async function getUserClubs(){
            try{
                if(!userHeader){
                    setIsLoading(false);
                    return;
                }

                setError(null);
                setIsLoading(true);

                const fetchedClubs: UserClubs[] = await ExtensionService.getUserClubs(userHeader.id);
                const requestedClubs: UserClubRequests[] = await ExtensionService.getUserRequests(userHeader.id);

                if(!fetchedClubs || !requestedClubs){
                    setError("Failed to Fetch User Clubs");
                    setIsLoading(false);
                    return;
                }

                setUserClubs(fetchedClubs);
                setUserClubRequests(requestedClubs);

                setIsLoading(false);
            } catch(error){
                setError("please contact support");
                setIsLoading(false);
            }
        }
    }, [userHeader]);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error } />

    return (
        <div className="club-cont">
            { !userHeader
                ? <NoUserOverlay setClosedSignIn={ setClosedSignIn } setClosedSignUp={ setClosedSignUp } />
                : <></>
            }
            <h1 className="title">Clubs</h1>
            <div className="clubs">
                { userClubs.length > 0
                    ? ( userClubs.map((userClub) => 
                        <ClubsComp 
                            userClub={ userClub } 
                            club={ userClub.club } 
                            changeFavorite={ changeFavorite }
                            key={ userClub.club.id}
                        />
                    ))
                    : <></>
                }
                { userClubRequests.map((userClubReq) => 
                    <ClubsComp 
                        userClub={ null }
                        club={ userClubReq.club } 
                        key={ userClubReq.club.id }
                        userRequest={ userClubReq }
                    />
                )}
                <button
                    className="create-club-btn"
                    onClick={ () => setClosedModifyClub(false) }
                >
                    Create Club
                </button>
                <button
                    className="search-club-btn"
                    onClick={ () => navigate("/search") }
                >
                    Join Clubs
                </button>
            </div>
        </div>
    );
}