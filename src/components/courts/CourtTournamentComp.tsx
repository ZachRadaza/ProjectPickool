import { useEffect, useState } from "react";
import { type CourtMatch, type CourtPlayer, type CourtTeam } from "../../utils/schemas";
import CourtMiniComp from "../ui/core/CourtMiniComp";

type CourtTournamentCompProp = {
    courtPlayers: CourtPlayer[];
    isSingles: boolean;
};

export default function CourtTournamentComp({ courtPlayers, isSingles }: CourtTournamentCompProp){
    const [courtTeams, setCourtTeams] = useState<Map<string, CourtTeam>>(new Map());
    const [courtMatches, setCourtMatches] = useState<CourtMatch[]>([]);

    function teamWins(matchId: string, teamWinId: string, teamLoseId: string){

    }

    useEffect(() => {
        setCourtTeams(() => {
            const teams = courtPlayers.map((player) => {
                const team: CourtTeam = {
                    id: `team-${crypto.randomUUID()}`,
                    teamPlayers: [player],
                    teamName: `team ${player.userHeader.username}`
                }

                return team;
            })

            const teamMap = new Map<string, CourtTeam>();

            teams.forEach((team) => {
                teamMap.set(team.id, team);
            });

            return teamMap;
        })

        
    }, [courtPlayers, isSingles]);

    return (
        <div className="court-tournament-cont">
            <div>
                <h4>Bracket</h4>
                <div>
                    <CourtMiniComp 
                        matchId="test"
                        teamOne={ {
                            id: `team-${crypto.randomUUID()}`,
                            teamPlayers: [courtPlayers[0]],
                            teamName: `team ${courtPlayers[0].userHeader.username}`
                        }}
                        teamTwo={ {
                            id: `team-${crypto.randomUUID()}`,
                            teamPlayers: [courtPlayers[1]],
                            teamName: `team ${courtPlayers[1].userHeader.username}`
                        }}
                        teamWins={ teamWins }
                        courtNumber={ 1 }
                    />
                </div>
            </div>
            <div>
                <h4>Team Builder</h4>
                <div>

                </div>
            </div>
        </div>
    );
}