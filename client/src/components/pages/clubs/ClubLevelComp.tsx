import { useEffect, useState } from "react";
import { Level, Role, type Club_Members, type Club_Members_Basic, type UserHeader } from "../../../utils/schemas";
import LevelChooser from "../../ui/LevelChooser";
import { ExtensionService } from "../../../utils/ExtensionService";

type ClubLevelCompProp = {
    userHeader: UserHeader | null;
    userClubMember: Club_Members | null;
    club_id: string | null;
};

export default function ClubLevelComp({ userHeader, userClubMember, club_id }: ClubLevelCompProp){
    const [level, setLevel] = useState<Level>(Level.BEGINNER);
    const [buttonMsg, setButtonMsg] = useState<string>("Request New Club Level");

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

    return (
        <div>
            <p>
                { userClubMember?.is_level_approved && userClubMember.level === level
                    ? "Your Club Level is approved"
                    : "Club Level is not approved"
                }
            </p>
            <LevelChooser 
                isPlayer={ true } 
                level={ level } 
                setLevel={ (level: Level) => setLevel(level) }
            />
            <button
                onClick={ () => reqNewLevel() }
            >
                { buttonMsg }
            </button>
        </div>
    );
}