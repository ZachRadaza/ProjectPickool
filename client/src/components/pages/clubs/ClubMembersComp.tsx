import { useEffect, useState, useRef } from "react";
import type { Club_Members } from "../../../utils/schemas";
import { ExtensionService } from "../../../utils/ExtensionService";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import "./ClubMembersComp.css";
import Button from "../../ui/buttons/Button";
import UserHeaderMiniComp from "../../ui/UserHeaderMiniComp";

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
                <Button 
                    content="Owner"
                    onBtnClick={ () => setOwnerOpened(!ownerOpened) }
                />
                <div 
                    className={ `dropdown ${ownerOpened ? "active" : ""}` }
                    ref={ ownerRef }
                    style={{ height: ownerHeight }}
                >
                    <UserHeaderMiniComp userHeader={ owner?.user! } />
                </div>
            </div>
            <div className="dropdown-cont admins">
                <Button
                    content={ `Admins (${admins.length})` }
                    onBtnClick={ () => setAdminOpened(!adminsOpened) }
                />
                { admins
                    ? <div 
                        className={ `dropdown ${adminsOpened ? "active" : ""}` }
                        ref={ adminRef }
                        style={{ height: adminHeight }}
                    >
                        { admins.map((admin) => 
                            <UserHeaderMiniComp userHeader={ admin.user } key={ admin.user.id } />
                        )}
                    </div>
                    : <></>
                }
            </div>
            <div className="dropdown-cont members">
                <Button
                    onBtnClick={ () => setMembersOpened(!membersOpened) }
                    content={ `Members (${members.length})` }
                />
                { members
                    ? <div 
                        className={ `dropdown ${membersOpened ? "active" : ""}` }
                        ref={ memberRef }
                        style={{ height: memberHeight }}
                    >
                        { members.map((member) => 
                            <UserHeaderMiniComp userHeader={ member.user } key={ member.user.id } />
                        )}
                    </div>
                    : <></>
                }
            </div>
        </div>
    );
}