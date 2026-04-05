import { useEffect, useState, useRef } from "react";
import type { Club_Members } from "../../../utils/schemas";
import { ExtensionService } from "../../../utils/ExtensionService";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import UserHeaderComp from "../../ui/UserHeaderComp";
import "./ClubMembersComp.css";

type ClubMembersComp = {
    club_id: string | null;
};

export default function ClubMembersComp({ club_id }: ClubMembersComp){
    const [members, setMembers] = useState<Club_Members[]>([]);
    const [admins, setAdmins] = useState<Club_Members[]>([]);
    const [owner, setOwner] = useState<Club_Members | null>(null);

    const [ownerOpened, setOwnerOpened] = useState<boolean>(false);
    const [adminsOpened, setAdminOpened] = useState<boolean>(false);
    const [membersOpened, setMembersOpened] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const ownerRef = useRef<HTMLDivElement>(null);
    const [ownerHeight, setOwnerHeight] = useState<number>(0);

    const adminRef = useRef<HTMLDivElement>(null);
    const [adminHeight, setAdminHeight] = useState<number>(0);

    const memberRef = useRef<HTMLDivElement>(null);
    const [memberHeight, setMemberHeight] = useState<number>(0);

    useEffect(() => {
        if(ownerOpened && ownerRef.current)
            setOwnerHeight(ownerRef.current.scrollHeight);
        else
            setOwnerHeight(0);
    }, [ownerOpened]);

    useEffect(() => {
        if(adminsOpened && adminRef.current)
            setAdminHeight(adminRef.current.scrollHeight);
        else
            setAdminHeight(0);
    }, [adminsOpened]);

    useEffect(() => {
        if(membersOpened && memberRef.current)
            setMemberHeight(memberRef.current.scrollHeight);
        else 
            setMemberHeight(0);
    }, [membersOpened]);

    useEffect(() => {
        getAllClubMembers();

        async function getAllClubMembers(){
            try{
                if(!club_id)
                    return;

                setIsLoading(true);

                const owner = await ExtensionService.getClubOwner(club_id);
                const admins = await ExtensionService.getClubAdmins(club_id);
                const members = await ExtensionService.getClubMembers(club_id);

                setOwner(owner);
                setAdmins(admins);
                setMembers(members);
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
            <div className="dropdown-cont owner">
                <button
                    onClick={ () => setOwnerOpened(!ownerOpened) }
                >
                    <h6>Owner</h6>
                </button>
                <div 
                    className="dropdown"
                    ref={ ownerRef }
                    style={{ height: ownerHeight }}
                >
                    <UserHeaderComp userHeader={ owner?.user! } clubInfoHeader={ owner! }/> 
                </div>
            </div>
            <div className="dropdown-cont admins">
                <button
                    onClick={ () => setAdminOpened(!adminsOpened) }
                >
                    <h6>Admins</h6>
                    <p>({ admins.length })</p>
                </button>
                { admins
                    ? <div 
                        className="dropdown"
                        ref={ adminRef }
                        style={{ height: adminHeight }}
                    >
                        { admins.map((admin) => 
                            <UserHeaderComp userHeader={ admin?.user! } clubInfoHeader={ admin } key={ admin.user.id }/>
                        )}
                    </div>
                    : <></>
                }
            </div>
            <div className="dropdown-cont members">
                <button
                    onClick={ () => setMembersOpened(!membersOpened) }
                >
                    <h6>Members</h6>
                    <p>({ members.length })</p>
                </button>
                { members
                    ? <div 
                        className="dropdown"
                        ref={ memberRef }
                        style={{ height: memberHeight }}
                    >
                        
                        { members.map((member) => 
                            <UserHeaderComp userHeader={ member?.user! } clubInfoHeader={ member } key={ member.user.id }/>
                        )}
                    </div>
                    : <></>
                }
            </div>
        </div>
    );
}