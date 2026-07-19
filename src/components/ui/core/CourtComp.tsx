import { useRef, useState } from "react";
import type { CourtTeam } from "../../../utils/schemas";
import UserHeaderMiniComp from "./UserHeaderMiniComp";
import { wait } from "../../../utils/random";
import EditButton from "../buttons/EditButton";
import Button from "../buttons/Button";
import "./CourtComp.css";

type CourtCompProp = {
    matchId: string;
    teamOne: CourtTeam;
    teamTwo: CourtTeam;
    teamWins: (matchId: string, teamWinId: string, teamLoseId: string) => void;
    courtNumber: number;
    isPlaying: boolean;
};

export default function CourtComp({ matchId, teamOne, teamTwo, teamWins, courtNumber, isPlaying }: CourtCompProp){
    const [matchName, setMatchName] = useState<string>(`Match #${courtNumber}`);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const matchNameInput = useRef<HTMLInputElement | null>(null);

    function matchNameEditHandler(){
        if(isEditing){
            setIsEditing(false);
            return;
        }

        setIsEditing(true);
        wait(50);
        matchNameInput.current?.focus();
    }

    return (
        <div className="court-comp">
            <div className="header-cont">
                { isEditing
                    ? <input
                        value={ matchName }
                        onChange={ (event) => setMatchName(event.target.value) }
                        onKeyDown={ (event) => {
                            if(event.key === "Enter")
                                setIsEditing(false);
                        }}
                        ref={ matchNameInput }
                    />
                    : <h6>{ matchName }</h6>
                }
                <EditButton 
                    onBtnClick={ matchNameEditHandler }
                />
            </div>
            <div className="players-cont">
                <div className="players left-side">
                    { teamOne.teamPlayers[0] &&
                        <UserHeaderMiniComp userHeader={ teamOne.teamPlayers[0].userHeader } />
                    }
                    { teamOne.teamPlayers[1] &&
                        <UserHeaderMiniComp userHeader={ teamOne.teamPlayers[1].userHeader } />
                    }
                </div>
                <div className="vs-cont">
                    <h5>VS</h5>
                </div>
                <div className="players right-side">
                    { teamTwo.teamPlayers[0] &&
                        <UserHeaderMiniComp userHeader={ teamTwo.teamPlayers[0].userHeader } />
                    }
                    { teamTwo.teamPlayers[1] &&
                        <UserHeaderMiniComp userHeader={ teamTwo.teamPlayers[1].userHeader } />
                    }
                </div>
            </div>
            { isPlaying && 
                <div className="btns-cont">
                    <Button 
                        content={ `${teamOne.teamName || "Team 1"} Wins` }
                        onBtnClick={ () => teamWins(matchId, teamOne.id, teamTwo.id) }
                        additionalClasses="team-one-btn"
                    />
                    <Button 
                        content={ `${teamTwo.teamName || "Team 2"} Wins` }
                        onBtnClick={ () => teamWins(matchId, teamTwo.id, teamOne.id)  }
                        additionalClasses="team-two-btn"
                    />
                </div>
            }
        </div>
    );
}