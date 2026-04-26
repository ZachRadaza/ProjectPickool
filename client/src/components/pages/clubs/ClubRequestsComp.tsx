import { useEffect, useState } from "react";
import type { Club_Requests } from "../../../utils/schemas";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import { ExtensionService } from "../../../utils/ExtensionService";
import UserHeaderComp from "../../ui/core/UserHeaderComp";
import "./ClubRequestsComp.css";

type ClubRequestsCompProp = {
    club_id: string | null;
    setNumRequests: (n: number) => void;
};

export default function ClubRequestsComp({ club_id, setNumRequests }: ClubRequestsCompProp){
    const [requests, setRequests] = useState<Club_Requests[] | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function approveUserRequest(user_id: string){
        if(!club_id)
            return;

        const approve = await ExtensionService.approveClubRequest(club_id, user_id);

        if(!approve){
            setError("Error in Approving User");
            return;
        }
        const removed = requests?.filter((reqs) => reqs.user?.id !== user_id ) ?? null;

        setRequests(removed);
        setNumRequests(removed?.length ?? 0);
    }

    async function denyUserRequest(user_id: string){
        if(!club_id)
            return;

        const deny = await ExtensionService.denyClubRequest(club_id, user_id);

        if(!deny){
            setError("Error in Denying User");
            return;
        }
        const removed = requests?.filter((reqs) => reqs.user?.id !== user_id ) ?? null;

        setRequests(removed);
        setNumRequests(removed?.length ?? 0);
    }

    useEffect(() => {
        getRequests();

        async function getRequests(){
            try{
                if(!club_id){
                    setIsLoading(false);
                    return;
                }

                const clubRequests = await ExtensionService.getClubRequests(club_id);

                if(!clubRequests){
                    setError("Error in Loading Club Requests");
                    setIsLoading(false);
                }
                
                setRequests(clubRequests);
                setNumRequests(clubRequests!.length);
                setIsLoading(false);
            } catch(error){
                setError("Error in Loading Club Requests");
                setIsLoading(false);
            }
        }
    }, [club_id]);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error }/>

    return (
        <div className="club-reqs-cont">
            { requests && requests.length > 0
            ? <>{ requests?.map((req) =>
                    <UserHeaderComp 
                        key={ req.user?.id } 
                        userHeader={ req.user! } 
                        clubInfoHeader={ null } 
                        approveClicked={ () => approveUserRequest(req.user?.id!) }
                        denyClicked={ () => denyUserRequest(req.user?.id!) }
                    />
            )}</>
            :<h6 className="no-reqs">No Club Requests</h6>
            }
        </div>
    );
}