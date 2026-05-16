import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import CloseButton from "../../components/ui/buttons/CloseButton";
import type { UserClubs, UserHeader } from "../../utils/schemas";
import { ExtensionService } from "../../utils/ExtensionService";
import ClubsComp from "../../components/ui/core/ClubsComp";
import { wait } from "../../utils/random";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import "./ClubSearchPopup.css";
import Button from "../../components/ui/buttons/Button";
import { useNavigate } from "react-router-dom";

type ClubSearchFunctionProp = {
    userHeader: UserHeader | null;
    setIsClosed: Dispatch<SetStateAction<boolean>>;
    setClosedModifyEvent?:  Dispatch<SetStateAction<boolean>>;
};

export default function ClubSearchPopup({ userHeader, setIsClosed, setClosedModifyEvent }: ClubSearchFunctionProp){
    const [clubs, setClubs] = useState<UserClubs[]>([]);

    const [isLoading, setIsLoading] =  useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        getClubs();

        async function getClubs(){
            if(!userHeader?.id){
                setIsLoading(false);
                setError("No User");
                return;
            }            
            
            const clubsData = await ExtensionService.UserService.getUserClubs(userHeader?.id);
            
            setClubs(
                clubsData.sort((a, b) => 
                    (Number(a.is_favorite) - Number(b.is_favorite)) * -1)
            );
            setIsLoading(false);
        }
    }, []);

    let content;

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error }/>;
    else
        content = <>
            <h4>Select A Club</h4>
            <div className="choose-clubs">
                { clubs.length === 0 
                    ? <>
                        <h6>You are not a member of any clubs</h6>
                        <Button 
                            content="Explore Clubs"
                            onBtnClick={ () => navigate('/search') }
                        />
                    </>
                    : <>
                        { clubs.map((club) => 
                            <div 
                                onClick={ async () => { 
                                    if(setClosedModifyEvent){
                                        await wait(200);
                                        setClosedModifyEvent(false);
                                        setIsClosed(true);
                                    }}
                                }
                            >
                                <ClubsComp 
                                    userClub={ club }
                                    club={ club.club }
                                    showFavorite={ true }
                                />
                            </div>
                        )}
                    </>
                }
            </div>
        </>

    return (
        <div className="popup club-search-popup">
            <CloseButton setIsClosed={ setIsClosed }/>
            { content }
        </div>
    );
}