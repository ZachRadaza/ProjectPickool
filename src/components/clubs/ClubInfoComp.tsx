import { useEffect, useState } from "react";
import type { Clubs, UserHeader } from "../../utils/schemas";
import UserHeaderMiniComp from "../ui/core/UserHeaderMiniComp";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import { ExtensionService } from "../../utils/ExtensionService";
import LocationIconComp from "../ui/icons/LocationIconComp";
import "./ClubInfoComp.css";
import EditButton from "../ui/buttons/EditButton";
import DeleteButton from "../ui/buttons/DeleteButton";

type ClubInfoCompProp = {
    club: Clubs | null;
    deleteClubBtn: () => void;
    editClubBtn: () => void;
}

export default function ClubInfoComp({ club, editClubBtn, deleteClubBtn }: ClubInfoCompProp){
    const [owner, setOwner] = useState<UserHeader | null>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getInfo();

        async function getInfo(){
            try{
                if(!club || !club.id){
                    setIsLoading(false);
                    setError("Club is null");
                    return;
                }

                const ownerData = await ExtensionService.ClubMemberService.getClubOwner(club.id);

                setOwner(ownerData?.user);
                setIsLoading(false);
            } catch(error){

            }
        }
    }, []);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error }/>;

    return (
        <div className="club-info-comp-cont">
            <div className="modify-club-btns">
                <EditButton onBtnClick={ editClubBtn }/>
                <DeleteButton onBtnClick={ deleteClubBtn } />
            </div>
            <div className="club-info-section">
                <h6>Description</h6>
                <p>{ club?.description || "No Description" }</p>
            </div>
            { club?.location &&
                <div className="club-info-section">
                    <h6>Club Location</h6>
                    <LocationIconComp location={ club?.location }/>
                </div>
            }
            <div className="club-info-section">
                <h6>Owner</h6>
                { owner && <UserHeaderMiniComp userHeader={ owner } /> }
            </div>
            { club?.created_at && <h6 className="created-at">Club Created on { new Date(club?.created_at).toLocaleDateString() }</h6> }
        </div>
    );
}