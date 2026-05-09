import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";
import type { Clubs, Events, UserHeader } from "../utils/schemas";
import { useEffect, useState } from "react";
import Button from "../components/ui/buttons/Button";
import FilterButton from "../components/ui/buttons/FilterButton";
import "./Search.css";
import CalendarComp from "../components/pages/events/CalendarComp";
import ClubsComp from "../components/ui/core/ClubsComp";
import SearchInput from "../components/ui/inputs/SearchInput";
import Loading from "./Loading";
import ErrorPage from "./Error";
import { ExtensionService } from "../utils/ExtensionService";

type Filters = {
    showClubs: boolean;
    showEvents: boolean;
    showNearMe: boolean;
}

type SearchContext = {
    userHeader: UserHeader | null;
    setClosedEditUser: (closed: boolean) => void;
};

export default function Search(){
    const { userHeader, setClosedEditUser } = useOutletContext<SearchContext>();

    const [searchInput, setSearchInput] = useState<string>("");
    const [events, setEvents] = useState<Events[]>([]);
    const [clubs, setClubs] = useState<Clubs[]>([]);

    const [filters, setFilters] = useState<Filters | null>(null);
    const [filterOptionsOpen, setFilterOptionsOpen] = useState<boolean>(false);
    const [searchMessage, setSearchMessage] = useState<string | null>(null);
    const [currentClubPage, setCurrentClubPage] = useState<number>(1);
    const [currentEventPage, setCurrentEventPage] = useState<number>(1);
    const [hasMoreClubs, setHasMoreClubs] = useState<boolean>(true);
    const [hasMoreEvents, setHasMoreEvents] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    let content;

    function setFilterURL(filterPartial: Partial<Filters>){
        if(!filters)
            return;

        const fil = { ...filters, ...filterPartial };

        const filtersString = 
            `${!fil.showClubs ? "clubs_" : "" }` +
            `${!fil.showEvents ? "events_" : ""}` +
            `${!fil.showNearMe ? "near_" : "" }`;

        const params = new URLSearchParams(location.search);
        params.set("filters", filtersString ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    function searchQuery(){
        const params = new URLSearchParams(location.search);
        params.set("query", searchInput ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    async function getClubs(loadMore: boolean){
        try{
            if(!userHeader || !filters || (!hasMoreClubs && loadMore))
                return;

            if(!loadMore)
                setCurrentClubPage(1);

            const currentPage = !loadMore ? 1 : currentClubPage;
            let res: { data: Clubs[], hasMore: boolean };

            if(!searchInput.trim())
                res = await ExtensionService.getNearbyClubs(userHeader.id, currentPage);
            else
                if(filters.showNearMe)
                    res = await ExtensionService.getQueryNearbyClubs(userHeader.id, searchInput, currentPage);
                else
                    res = await ExtensionService.getQueryClubs(searchInput, currentPage);

            loadMore ? setClubs([...clubs, ...res.data]) : setClubs(res.data);
            setCurrentClubPage(currentPage + 1);
            setHasMoreClubs(res.hasMore);
        } catch(error){
            setError("Error in loading clubs");
        }
    }

    async function getEvents(loadMore: boolean){
        try{
            if(!userHeader || !filters || (!hasMoreEvents && loadMore))
                return;

            const currentPage = !loadMore ? 1 : currentEventPage;
            let res: { data: Events[], hasMore: boolean };

            if(!searchInput.trim())
                res = await ExtensionService.getNearUserEvents(userHeader.id, currentPage);
            else
                if(filters.showNearMe)
                    res = await ExtensionService.getQueryNearUserEvents(userHeader.id, searchInput, currentPage);
                else
                    res = await ExtensionService.getQueryEvents(searchInput, currentPage);

            loadMore ? setEvents([...events, ...res.data]) : setEvents(res.data);
            setCurrentEventPage(currentPage + 1);
            setHasMoreEvents(res.hasMore);
        } catch(error){
            setError("Error in loading events");
        }
    }

    useEffect(() => {
        const filter = searchParams.get("filters");

        const filterRet: Filters = {
            showClubs: !filter?.includes("clubs"),
            showEvents: !filter?.includes("events"),
            showNearMe: !filter?.includes("near")
        }

        setFilters(filterRet);
    }, [searchParams.get("filters")])

    useEffect(() => {
        const query = searchParams.get("query");

        setSearchInput(query || "");

        getQuery();

        setSearchMessage(`${searchInput 
            ? `Showing Results for "${searchInput}" ${filters?.showNearMe ? "Located Near You." : ""}` 
            : ""}`
        );

        async function getQuery(){
            try{
                setIsLoading(true);

                if(!userHeader){
                    setIsLoading(false);
                    return;
                }

                if(filters?.showClubs)
                    await getClubs(false);
                

                if(filters?.showEvents)
                    await getEvents(false);
                
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Error in Loading Items");
            }
        }
    }, [searchParams.get("query"), filters]);

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error }/>
    else
        content = <>
            { filters?.showClubs &&
                <div className="search-content">
                    <h2>Clubs</h2>
                    <div className="club-contents">
                        { clubs.length > 0
                            ? <>
                                { clubs.map((club) => 
                                    <ClubsComp club={ club } userClub={ null } key={ club.id }/>
                                )}
                            </>
                            : <h6>No Clubs Found</h6>
                        }
                        { hasMoreClubs &&
                            <Button
                                content="Load More Clubs"
                                onBtnClick={ () => getClubs(true) }
                                additionalClasses="clubs-load-more"
                            />
                        }
                    </div>
                </div>
            }
            { filters?.showEvents &&
                <div className="search-content">
                    <h2>Events</h2>
                    <CalendarComp events={ events } showClub={ true } userHeader={ userHeader }/>
                    { hasMoreClubs &&
                        <Button
                            content="Load More Events"
                            onBtnClick={ () => getEvents(true) }
                            additionalClasses="clubs-load-more"
                        />
                    }
                </div>
            }
        </>;

    return (
        <div className="search-cont">
            <h1 className="search-title">Explore</h1>
            <h6>{ searchMessage }</h6>
            <div className="search-area">
                <SearchInput 
                    value={ searchInput }
                    setValue={ setSearchInput }
                    search={ searchQuery }
                />
                <div className="search-options">
                    <div className="filter-cont">
                        <FilterButton onBtnClick={ () => setFilterOptionsOpen(!filterOptionsOpen) } />
                        <div className={`filter-options ${filterOptionsOpen ? "" : "hidden"}`}>
                            <Button 
                                content="Clubs" 
                                onBtnClick={ () => setFilterURL({ showClubs: !filters?.showClubs }) } 
                                additionalClasses={ `bg ${filters?.showClubs ? "toggled" : ""}` }
                            />
                            <Button 
                                content="Events" 
                                onBtnClick={ () => setFilterURL({ showEvents: !filters?.showEvents }) } 
                                additionalClasses={ `bg ${filters?.showEvents ? "toggled" : ""}` }
                            />
                            <Button
                                content="Near Me"
                                onBtnClick={ () => setFilterURL({ showNearMe: !filters?.showNearMe }) } 
                                additionalClasses={ `bg ${filters?.showNearMe ? "toggled" : ""}` }
                            />      
                        </div>
                    </div>
                    <Button 
                        content="Edit User Location"
                        onBtnClick={ () => setClosedEditUser(false) }
                        additionalClasses="edit-loc"
                    />
                </div>
            </div>
            { content }
        </div>
    );
}