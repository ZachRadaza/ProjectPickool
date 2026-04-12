import { useEffect, useState } from "react";
import type { UserClubs, Users } from "../../../utils/schemas";
import ClubsComp from "../../ui/ClubsComp";
import { ExtensionService } from "../../../utils/ExtensionService";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import "./UserTabClubsComp.css";

type UserTabClubsCompProp = {
    user: Users | null;
};

export default function UserTabClubsComp({ user }: UserTabClubsCompProp){
    const [userClubs, setUserClubs] = useState<UserClubs[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getUserClubs();

        async function getUserClubs(){
            try{
                if(!user){
                    setIsLoading(false);
                    return;
                }

                const clubs = await ExtensionService.getUserClubs(user.id!);

                if(!clubs){
                    setError("Error in Loading Clubs");
                    setIsLoading(false);
                    return;
                }

                setUserClubs(clubs);
                setIsLoading(false);
            } catch(error){
                setError("Error in Loading Clubs")
                setIsLoading(false);
            }
        }
    }, [user]);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error } />

    return (
        <div className="user-tab-club-cont">
            { userClubs.map((userClub) => 
                <ClubsComp club={ userClub.club } userClub={ userClub } key={ userClub.club.id } />
            )}
        </div>
    );
}