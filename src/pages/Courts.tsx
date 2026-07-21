import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import Loading from "./Loading";
import ErrorPage from "./Error";
import CourtOpenPlayComp from "../components/courts/CourtOpenPlayComp";
import CourtTournamentComp from "../components/courts/CourtTournamentComp";
import Button from "../components/ui/buttons/Button";
import { EventType, type Clubs, type CourtPlayer, type UserHeader } from "../utils/schemas";
import "./Courts.css";
import UsersDropdown from "../components/user/UsersDropdown";
import PopupWrapper from "../popups/PopupWrapper";
import ClubSearchPopup from "../popups/clubs/ClubSearchPopup";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { deleteFromCache, getFromCache, saveToCache, wait } from "../utils/random";
import { ExtensionService } from "../utils/ExtensionService";
import ClubsComp from "../components/ui/core/ClubsComp";
import UserSearchPopup from "../popups/clubs/UserSearchPopup";
import AddGuestPopup from "../popups/courts/AddGuestPopup";

type CourtsContext = {
    userHeader: UserHeader | null;
    club_id: string | null;
    setClosedNoUserPopup: Dispatch<SetStateAction<boolean>>;
}

export default function Courts(){
    const { userHeader, club_id, setClosedNoUserPopup } = useOutletContext<CourtsContext>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    const [closedClubSearch, setClosedClubSearch] = useState<boolean>(true);
    const [closedPlayerSearch, setClosedPlayerSearch] = useState<boolean>(true);
    const [closedAddGuest, setClosedAddGuest] = useState<boolean>(true);

    const [currentClub, setCurrentClub] = useState<Clubs | null>(null);
    const [numCourts, setNumCourts] = useState<number>(1);
    const [isSingles, setIsSingles] = useState<boolean>(true);
    const [currentTab, setCurrentTab] = useState<EventType>(EventType.OPENPLAY);

    const [players, setPlayers] = useState<UserHeader[]>([]); //used for url and base user info
    const [courtPlayers, setCourtPlayers] = useState<CourtPlayer[]>([]); // used in tabs comps

    const navigate = useNavigate();
    const location = useLocation();

    const tabMap = {
        [EventType.OPENPLAY]: <CourtOpenPlayComp courtPlayers={ courtPlayers } isSingles={ isSingles } numCourts={ numCourts } />,
        [EventType.TOURNAMENT]: <CourtTournamentComp courtPlayers={ courtPlayers } isSingles={ isSingles } />,
        [EventType.DUPR]: <CourtTournamentComp courtPlayers={ courtPlayers } isSingles={ isSingles } />,
    };

    function currentTabClass(tabType: EventType){
        return `bg ${tabType === currentTab ? "active" : ""}`;
    }

    function addPlayer(player: UserHeader){
        setPlayers([...players, player]);
    }

    function removePlayer(userId: string){
        setPlayers((ps) => ps.filter((player) => player.id !== userId));
        deleteFromCache(`court-player-${userId}`);
    }

    function resetAll(){
        players.forEach((p) => deleteFromCache(`court-player-${p.id}`))

        setNumCourts(1);
        setPlayers([]);
        setCurrentClub(null);
        setIsSingles(true);
    }

    function createNewCourtPlayer(player: UserHeader){
        const courtPlayer: CourtPlayer = {
            userHeader: player,
            wins: 0,
            gamesPlayed: 0
        };
        
        saveToCache(`court-player-${player.id}`, courtPlayer, 48);

        return courtPlayer;
    }

    function checkPlayer(player: UserHeader){
        for(const courtPlayer of courtPlayers){
            if(player.id === courtPlayer.userHeader.id){
                return courtPlayer;
            }
        }
        
        return handleNewPlayer(player);
    }

    function handleNewPlayer(player: UserHeader){
        let newPlayer: CourtPlayer | null = checkNewPlayerCache(player);
        if(!newPlayer)
            newPlayer = createNewCourtPlayer(player);

        return newPlayer;
    }

    function checkNewPlayerCache(player: UserHeader){
        const cachedCourtPlayer = getFromCache<CourtPlayer>(`court-player-${player.id}`);

        return cachedCourtPlayer;
    }

    async function addClubPlayer(user_id: string){
        try{
            if(!user_id)
                return;

            const addedClubUser = await ExtensionService.UserService.getUserHeader(user_id);

            if(addedClubUser)
                addPlayer(addedClubUser);
        } catch(error){
            setError("Error in Adding Club Player");
        }
    }

    async function getClub(clubId: string){
        try{
            if(!clubId)
                return;

            const chosenClub = await ExtensionService.ClubService.getClub(clubId);

            setCurrentClub(chosenClub ? chosenClub : null);
        } catch(error){
            setError("Error in fetching club info");
        }
    }

    async function getPlayers(playerIds: string[]){
        try{
            const cleanedPlayerIds = playerIds.filter((id) => !id.toLowerCase().includes("guest"));
            const guestPlayers = playerIds.filter((id) => id.toLowerCase().includes("guest"));

            const fetchedPlayers = await ExtensionService.UserService.getUserHeadersList(cleanedPlayerIds);

            for(const guest of guestPlayers){
                const guestUser: UserHeader = {
                    id: guest,
                    username: guest.split("|")[1],
                    profile_pic: import.meta.env.VITE_DEFAULT_PROFILE_PIC
                };

                fetchedPlayers.push(guestUser);
            }

            setPlayers(fetchedPlayers);
        } catch(error){
            setError("Error in fetching player info");
        }
    }

    useEffect(() => {
        setIsLoading(true);

        const params = new URLSearchParams(location.search);
        const paramsIsSingles = params.get("issingles");
        const paramsClubId = params.get("clubid");
        const paramsPlayers = params.getAll("player");
        const paramsCourtNum = params.get("numcourts");
        const paramsEventType = params.get("eventtype");

        setIsSingles(paramsIsSingles ? paramsIsSingles?.trim().toLowerCase() === "true" : true);
        getClub(paramsClubId || "");
        getPlayers(paramsPlayers);
        setNumCourts(Number(paramsCourtNum) || 1);
        setCurrentTab(paramsEventType as EventType);

        setIsLoading(false);
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        currentClub?.id
            ? params.set("clubid", currentClub?.id)
            : params.delete("clubid");

        navigate(`${location.pathname}?${params.toString()}`);
    }, [currentClub]);
    
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        params.delete("player");

        for(const player of players){
            params.append("player", player.id);
        }
        
        navigate(`${location.pathname}?${params.toString()}`);
    }, [players]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        params.set("numcourts", numCourts.toString());
        navigate(`${location.pathname}?${params.toString()}`);
    }, [numCourts]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        params.set("issingles", isSingles ? "true" : "false");
        navigate(`${location.pathname}?${params.toString()}`);
    }, [isSingles]);

    useEffect(() => {
        if(!club_id)
            return;

        deleteClubParams();
        getClub(club_id);

        async function deleteClubParams(){
            await wait(50);
            const params = new URLSearchParams(location.search);
            params.delete("club");
            params.delete("clubtab");

            navigate({
                pathname: location.pathname,
                search: params.toString(),
            });
        }
    }, [club_id]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        params.set("eventtype", currentTab);
        navigate(`${location.pathname}?${params.toString()}`);
    }, [currentTab]);

    useEffect(() => {
        const tempCourtPlayers: CourtPlayer[] = [];
        for(const player of players){
            tempCourtPlayers.push(checkPlayer(player));
        }

        setCourtPlayers(tempCourtPlayers);
    }, [players]);

    if(isLoading)
        return <Loading/>;

    if(error)
        return <ErrorPage error={ error }/>;

    return (
        <>
            <div className="courts-cont">
                <div className="general-info-cont">
                    <h1 className="title">Courts <span>Beta</span></h1>
                    <div className="court-info-row">
                        <div className="court-num-cont">
                            <div className="court-num-inputs">
                                <Button 
                                    content="-"
                                    onBtnClick={ () => {
                                        if(numCourts > 1)
                                            setNumCourts(numCourts - 1);  
                                    }}
                                />
                                <h1>{ numCourts }</h1>
                                <Button 
                                    content="+"
                                    onBtnClick={ () => setNumCourts(numCourts + 1) }
                                />
                            </div>
                            <h5>Number of Courts</h5>
                        </div>
                        <div className="is-singles-cont">
                            <Button 
                                content="Singles"
                                onBtnClick={ () => setIsSingles(true) }
                                additionalClasses={`is-singles-btn ${isSingles ? "active" : ""}`}
                            />
                            <Button 
                                content="Doubles"
                                onBtnClick={ () => setIsSingles(false) }
                                additionalClasses={`is-singles-btn ${!isSingles ? "active" : ""}`}
                            />
                        </div>
                    </div>
                    <div className="use-club-wrapper">
                        <div className="use-club-cont">
                            <h5>Use Club for Adding Players?</h5>
                            <div className="btn-cont">
                                <Button 
                                    content="Choose Club"
                                    onBtnClick={ () => userHeader ? setClosedClubSearch(false) : setClosedNoUserPopup(false) }
                                    additionalClasses={ currentClub !== null ? "active" : "" }
                                />
                                <Button 
                                    content="No"
                                    onBtnClick={ () => setCurrentClub(null) }
                                    additionalClasses={ currentClub === null ? "active" : "" }
                                />
                            </div>
                        </div>
                        { currentClub !== null &&
                            <ClubsComp 
                                club={ currentClub }
                                userClub={ null }
                                isMini={ true }
                            />
                        }
                    </div>
                    <UsersDropdown 
                        users={ players }
                        isMini={ true }
                        showNum={ true }
                        content="Players"
                        addButton={ true }
                        onAddBtnClick={ () => { currentClub ? setClosedPlayerSearch(false) : setClosedAddGuest(false) } }
                        denyClicked={ removePlayer }
                    />
                    <Button 
                        content="Reset All"
                        onBtnClick={ resetAll }
                        additionalClasses="red"
                    />
                </div>
                <div className="tab-cont">
                    <div className="court-tab-row">
                        <Button 
                            content="Open Play" 
                            onBtnClick={ () => setCurrentTab(EventType.OPENPLAY) } 
                            additionalClasses={ currentTabClass(EventType.OPENPLAY) } 
                        />
                        <Button 
                            content="Tournament" 
                            onBtnClick={ () => setCurrentTab(EventType.TOURNAMENT) }
                            additionalClasses={ currentTabClass(EventType.TOURNAMENT) }    
                        />
                    </div>
                    <div className="tab-content">{ currentTab ? tabMap[currentTab] : null }</div>
                </div>
            </div>
            <PopupWrapper 
                popupComp={
                    <ClubSearchPopup 
                        userHeader={ userHeader }
                        setIsClosed={ setClosedClubSearch }
                    />
                }
                isClosed={ closedClubSearch }
            />
            <PopupWrapper
                popupComp={
                    <UserSearchPopup 
                        club_id={ currentClub?.id! }
                        setIsClosed={ setClosedPlayerSearch }
                        canApprove={ true }
                        approveClicked={ addClubPlayer }
                        approveContent="Add Player"
                        usersApproved={ players }
                    />      
                }
                isClosed={ closedPlayerSearch }
            />
            <PopupWrapper 
                popupComp={
                    <AddGuestPopup 
                        setIsClosed={ setClosedAddGuest }
                        addPlayer={ addPlayer }
                    />
                }
                isClosed={ closedAddGuest }
            />
        </>
    );
}