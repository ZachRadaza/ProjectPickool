import { useState } from "react";
import type { CourtTeam } from "../../../utils/schemas";
import UserHeaderMiniComp from "./UserHeaderMiniComp";
import CourtComp from "./CourtComp";
import "./CourtMiniComp.css";

type CourtCompProp = {
    matchId: string;
    teamOne: CourtTeam;
    teamTwo: CourtTeam;
    teamWins: (matchId: string, teamWinId: string, teamLoseId: string) => void;
    courtNumber: number;
};

export default function CourtMiniComp({ matchId, teamOne, teamTwo, teamWins, courtNumber }: CourtCompProp){
    const [showCourtComp, setShowCourtComp] = useState<boolean>(false);

    function teamWinsThenClose(matchId: string, teamWinId: string, teamLoseId: string){
        teamWins(matchId, teamWinId, teamLoseId);
        setShowCourtComp(false);
    }

    return (
        <div className="court-mini-comp">
            <div className="info-cont" onClick={ () => setShowCourtComp(!showCourtComp)}>
                <div className="team-cont">
                    { teamOne.teamPlayers.map((player) => 
                        <UserHeaderMiniComp userHeader={ player.userHeader } />
                    )}
                </div>
                <div className="vs-cont">
                    <h6>VS</h6>
                </div>
                <div className="team-cont">
                    { teamTwo.teamPlayers.map((player) => 
                        <UserHeaderMiniComp userHeader={ player.userHeader } />
                    )}
                </div>
            </div>
            { showCourtComp &&
                <div className="court-comp-wrapper">
                    <CourtComp 
                        matchId={ matchId }
                        teamOne={ teamOne }
                        teamTwo={ teamTwo }
                        teamWins={ teamWinsThenClose }
                        courtNumber={ courtNumber }
                        isPlaying={ true }
                    />
                </div>
            }
        </div>
    )
}