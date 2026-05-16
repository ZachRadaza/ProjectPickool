import { useEffect, useState } from "react";
import type { Club_Members } from "../../utils/schemas";
import { ExtensionService } from "../../utils/ExtensionService";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import "./ClubMembersComp.css";
import UsersDropdown from "../user/UsersDropdown";

type ClubMembersComp = {
    club_id: string | null;
};

export default function ClubMembersComp({ club_id }: ClubMembersComp){
    const [members, setMembers] = useState<Club_Members[]>([]);
    const [admins, setAdmins] = useState<Club_Members[]>([]);
    const [owner, setOwner] = useState<Club_Members | null>(null);
    const [currentMemberPage, setCurrentMemberPage] = useState<number>(1);
    const [membersPageHasMore, setMembersPageHasMore] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function getMembers(){
        try{
            if(!club_id || !membersPageHasMore)
                return;

            const { data: membersFetched, hasMore } = await ExtensionService.ClubMemberService.getClubMembers(club_id, currentMemberPage);

            if(!membersFetched){
                setMembersPageHasMore(hasMore);
                return;
            }
            setMembers([...members, ...membersFetched]);
            setCurrentMemberPage(currentMemberPage + 1);
            setMembersPageHasMore(hasMore);
        } catch(error){
            setError("Error in Loading Club Members");
        }
    }

    useEffect(() => {
        getAllClubMembers();

        async function getAllClubMembers(){
            try{
                if(!club_id)
                    return;

                setIsLoading(true);

                const owner = await ExtensionService.ClubMemberService.getClubOwner(club_id);
                const admins = await ExtensionService.ClubMemberService.getClubAdmins(club_id);
                await getMembers();

                setOwner(owner);
                setAdmins(admins);
                setIsLoading(false);
            } catch(error: any){
                setError("Error in Loading Club Members");
                setIsLoading(false);
            }
        }
    }, [club_id])

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error } />;

    return (
        <div className="club-members-cont">     
            <UsersDropdown 
                users={ owner?.user ? [owner.user] : []}
                content="Owner"
                isMini={ true }
                showNum={ false }
            />
            <UsersDropdown 
                users={ admins.map((member) => member.user) }
                content="Admins"
                isMini={ true }
                showNum={ true }
            />
            <UsersDropdown
                users={ members.map((member) => member.user) }
                content="Members"
                isMini={ true }
                showNum={ true }
                addIsShowMore={ true }
                addButton={ membersPageHasMore }
                onAddBtnClick={ () => getMembers() }
            />
        </div>
    );
}