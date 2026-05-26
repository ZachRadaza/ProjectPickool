import { useNavigate, useOutletContext } from "react-router";
import Button from "../components/ui/buttons/Button";
import CalendarComp from "../components/events/CalendarComp";
import type { Events, UserHeader } from "../utils/schemas";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { ExtensionService } from "../utils/ExtensionService";
import Loading from "./Loading";
import ErrorPage from "./Error";
import "./Home.css";
import PopupWrapper from "../popups/PopupWrapper";
import CreateOptionsPopup from "../popups/home/CreateOptionsPopup";
import ClubSearchPopup from "../popups/clubs/ClubSearchPopup";

type HomeContext = {
    userHeader: UserHeader | null;
    setClosedNoUserPopup: Dispatch<SetStateAction<boolean>>;
    setClosedModifyClub: Dispatch<SetStateAction<boolean>>;
    setClosedModifyEvent: Dispatch<SetStateAction<boolean>>;
    setClosedModifyPost: Dispatch<SetStateAction<boolean>>;
}

export default function Home(){
    const { userHeader, setClosedNoUserPopup, setClosedModifyClub, setClosedModifyEvent, setClosedModifyPost } = useOutletContext<HomeContext>();
    const navigate = useNavigate();
    
    const [events, setEvents] = useState<Events[]>([]);
    const [currentEventPage, setCurrentEventPage] = useState<number>(1);
    const [hasMoreEvents, setHasMoreEvents] = useState<boolean>(true);
    const [closedCreateOptions, setClosedCreateOptions] = useState<boolean>(true);
    const [closedClubSearch, setClosedClubSearch] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function getUserEvents(firstLoad: boolean){
        try{
            if(!hasMoreEvents)
                return;
            
            const pageNum = firstLoad ? 1 : currentEventPage;
            
            let fetchedInfo: { data: Events[], hasMore: boolean };

            fetchedInfo = !userHeader?.id
                ? await ExtensionService.EventService.getTopEvents(pageNum)
                : await ExtensionService.EventService.getPossibleUserEvents(userHeader.id, pageNum);

            setEvents([...events, ...fetchedInfo.data]);
            setCurrentEventPage(pageNum + 1);
            setHasMoreEvents(fetchedInfo.hasMore);
        } catch(error){
            setError("Error in Fetching Events");
        }
    }

    useEffect(() => {
        getData();

        async function getData(){
            setIsLoading(true);

            await getUserEvents(true);

            setIsLoading(false);

            if(!userHeader?.id)
                setClosedNoUserPopup(false);
            }
    }, [])

    if(isLoading)
        return <Loading />;
    
    if(error)
        return <ErrorPage error={ error }/>;
    
    return (
        <>
            <div className="home-cont">
                <div className="main-btns">
                    <Button 
                        content="My Clubs"
                        onBtnClick={ () => navigate("/clubs") }
                    />
                    <Button
                        content="Profile"
                        onBtnClick={ () => 
                            !userHeader
                                ? setClosedNoUserPopup(false)
                                : navigate(`/user/${userHeader?.id ? userHeader?.id : "guest"}`) 
                        }
                    />
                    <Button 
                        content="Events"
                        onBtnClick={ () => navigate("/events") }
                    />
                    <Button 
                        content="Create +"
                        onBtnClick={ () =>  
                            !userHeader
                                ? setClosedNoUserPopup(false)
                                : setClosedCreateOptions(false) 
                        }
                    />
                </div>
                <div className="user-events">
                    <CalendarComp 
                        events={ events }
                        userHeader={ userHeader }
                        setClosedModifyEvent={ setClosedModifyEvent }
                        openClubSearchOnClick={ true }
                        setClosedClubSearch={ setClosedClubSearch }
                    />
                    { hasMoreEvents && 
                        <Button 
                            content="Load More"
                            onBtnClick={ () => getUserEvents(false) }
                        />
                    }
                </div>
            </div>
            <PopupWrapper 
                isClosed={ closedCreateOptions }
                popupComp={
                    <CreateOptionsPopup
                        userHeader={ userHeader }
                        setIsClosed={ setClosedCreateOptions }
                        setClosedModifyClub={ setClosedModifyClub }
                        setClosedModifyEvent={ setClosedModifyEvent }
                        setClosedModifyPost={ setClosedModifyPost }
                    />
                }
            />
            <PopupWrapper 
                popupComp={
                    <ClubSearchPopup 
                        userHeader={ userHeader }
                        setIsClosed={ setClosedClubSearch }
                        setClosedModifyEvent={ setClosedModifyEvent }
                        creatingEvent={ true }
                    />
                }
                isClosed={ closedClubSearch }
            />
        </>
    );
}