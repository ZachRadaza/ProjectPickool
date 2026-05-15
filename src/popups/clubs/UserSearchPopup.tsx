import { useEffect, useState } from "react";
import { type Club_Members, type UserHeader } from "../../utils/schemas";
import CloseButton from "../../components/ui/buttons/CloseButton";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import SearchInput from "../../components/ui/inputs/SearchInput";
import UserHeaderComp from "../../components/ui/core/UserHeaderComp";
import { ExtensionService } from "../../utils/ExtensionService";
import "./UserSearchPopup.css";
import Button from "../../components/ui/buttons/Button";

type UserSearchPopup = {
    club_id: string | null;
    canApprove?: boolean;
    setIsClosed: (closed: boolean) => void;
    approveClicked?: (user_id: string) => void;
    approveContent?: string;
    usersApproved?: UserHeader[];
};

export default function UserSearchPopup({ club_id, canApprove, setIsClosed, approveClicked, approveContent, usersApproved }: UserSearchPopup){
    const [searchInput, setSearchInput] = useState<string>("");
    const [searchedMembers, setSearchedMembers] = useState<Club_Members[]>([]);
    const [message, setMessage] = useState<string | null>("Search Club Members");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasMorePages, setHasMorePages] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    let content;

    async function searchUser(loadMore: boolean){
        try{
            setIsLoading(true);

            if(!club_id){
                setIsLoading(false);
                setError("Club Id Required")
                return;
            }

            if(!searchInput){
                setMessage("Search Club Members");
                setIsLoading(false);
                return;
            }

            if(!hasMorePages)
                return;

            let { data: members, hasMore } = await ExtensionService.ClubMemberService.getQueryClubMembers(club_id, searchInput, currentPage);
            
            if(usersApproved){
                const approvedIds = new Set(usersApproved.map(user => user.id));

                members = members.filter(
                    member => !approvedIds.has(member.user.id)
                );
            }

            if(loadMore)
                setSearchedMembers([...searchedMembers, ...members]);
            else {
                setSearchedMembers(members);
                setCurrentPage(1);
            }

            setMessage(!searchInput ? "Search Club Members" : `No Club Members For "${searchInput}"`);
            setCurrentPage(currentPage + 1);
            setHasMorePages(hasMore);

            setIsLoading(false);
        } catch(error){
            setIsLoading(false);
            setError("Error in Search")
        }
    }

    useEffect(() => {
        if(usersApproved){
            const approvedIds = new Set(usersApproved.map(user => user.id));

            const members = searchedMembers.filter(
                member => !approvedIds.has(member.user.id)
            );

            setSearchedMembers(members);
        }
    }, [usersApproved]);


    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error }/>;
    else
        content = <>
            { searchedMembers.length > 0
                ? <>
                    { searchedMembers.map((member) => 
                        canApprove
                            ? <UserHeaderComp 
                                userHeader={ member.user }
                                clubInfoHeader={ member }
                                approveClicked={ () => { if(approveClicked) approveClicked(member.user.id) }}
                                key={ member.user.id }
                                approveContent={ approveContent }
                            />
                            : <UserHeaderComp 
                                userHeader={ member.user }
                                clubInfoHeader={ member }
                                key={ member.user.id }
                            />
                    )}
                    { hasMorePages && <Button content="Load More" onBtnClick={ () => searchUser(true) } />}
                </>
                : <h6>{ message }</h6>
            }
        </>

    return (
        <div className="popup user-search-popup">
            <CloseButton setIsClosed={ setIsClosed } />
            <h4>Search for Users</h4>
            <SearchInput 
                value={ searchInput }
                setValue={ setSearchInput }
                search={ () => searchUser(false) }
            />
            <div className="content-cont">
                { content }
            </div>
        </div>
    );
}