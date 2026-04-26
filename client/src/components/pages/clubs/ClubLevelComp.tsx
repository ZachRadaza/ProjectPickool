import { useEffect, useState } from "react";
import { Level, Role, type Club_Members, type Club_Members_Basic, type UserHeader } from "../../../utils/schemas";
import LevelChooser from "../../ui/choosers/LevelChooser";
import { ExtensionService } from "../../../utils/ExtensionService";
import Button from "../../ui/buttons/Button";
import "./ClubLevelComp.css";
import Loading from "../../../pages/Loading";
import ErrorPage from "../../../pages/Error";
import UserHeaderMiniComp from "../../ui/core/UserHeaderMiniComp";

type ClubLevelCompProp = {
    userHeader: UserHeader | null;
    userClubMember: Club_Members | null;
    club_id: string | null;
    setUserClubMember: (clubMember: Club_Members) => void;
};

export default function ClubLevelComp({ userHeader, userClubMember, club_id, setUserClubMember }: ClubLevelCompProp){
    const [level, setLevel] = useState<Level>(Level.BEGINNER);
    const [buttonMsg, setButtonMsg] = useState<string>("Request New Club Level");
    const [unnapprovedUsers, setUnapprovedUsers] = useState<Club_Members[]>([]);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    async function reqNewLevel(){
        if(!userHeader || !userClubMember || !club_id)
            return;

        setButtonMsg("Sending New Level...");
    
        const is_level_approved = userClubMember.role === Role.ADMIN || userClubMember.role === Role.OWNER;

        const updates: Partial<Club_Members_Basic> = { is_level_approved, level };

        const updatedMem = await ExtensionService.updateClubMember(club_id, userHeader.id, updates);

        if(!updatedMem){
            setButtonMsg("Failed to Send");
            return;
        }

        setUserClubMember(updatedMem);

        if(is_level_approved)
            setButtonMsg("New Level Set");
        else
            setButtonMsg("Sent New Request");
    }

    useEffect(() => {
        setLevel(userClubMember?.level ?? Level.BEGINNER);

        if(userClubMember?.role === Role.ADMIN || userClubMember?.role === Role.OWNER)
            setButtonMsg("Set New Level");
    }, [userClubMember]);

    useEffect(() => {
        getUnapprovedUsers();

        async function getUnapprovedUsers(){
            try{
                if(!userClubMember || userClubMember.role === Role.MEMBER || !club_id){
                    setIsLoading(false);
                    return;
                }

                setIsLoading(true);

                const unapproved = await ExtensionService.getClubUnapproved(club_id);

                setUnapprovedUsers(unapproved ?? []);
                setIsLoading(false);
            } catch(error){
                setIsLoading(false);
                setError("Error in fetching Unapproved Users");
            }
        }
    }, [club_id, userClubMember]);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error } />;

    return (
        <div className="club-level-comp-cont">
            <div className="setting-area">
                <h5 className="club-level-info">
                    { userClubMember?.is_level_approved && userClubMember.level === level
                        ? "Your Player Level is approved"
                        : "Player Level is not approved"
                    }
                </h5>
                <div className="club-level-pair">
                    <h6>Player Level: </h6>
                    <LevelChooser 
                        isPlayer={ true } 
                        level={ level } 
                        setLevel={ (level: Level) => setLevel(level) }
                    />
                </div>
                <Button
                    onBtnClick={ () => reqNewLevel() }
                    content={ buttonMsg }
                    additionalClasses="req-new-level-btn"
                />
            </div>
            { userClubMember?.role === Role.ADMIN || userClubMember?.role === Role.OWNER &&
                <div className="approve-ratings">
                    { unnapprovedUsers.length > 0 &&
                        <>
                            <h5 className="title">Approve Member Ratings</h5>
                            <div className="unapproved-users">
                                { unnapprovedUsers.map((unap) => 
                                    <UserHeaderMiniComp userHeader={ unap.user } key={ unap.user.id }/>
                                )}
                            </div>
                        </>
                    }
                </div>
            }
        </div>
    );
}