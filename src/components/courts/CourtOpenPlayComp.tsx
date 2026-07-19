import { useEffect, useState } from "react";
import { type CourtMatch, type CourtPlayer, type CourtTeam, type UserHeader } from "../../utils/schemas";
import CourtComp from "../ui/core/CourtComp";
import "./CourtOpenPlayComp.css";
import { useNavigate } from "react-router-dom";
import { saveToCache } from "../../utils/random";

type CourtOpenPlayCompProp = {
    courtPlayers: CourtPlayer[];
    isSingles: boolean;
    numCourts: number;
};

export default function CourtOpenPlayComp({ courtPlayers, isSingles, numCourts }: CourtOpenPlayCompProp){
    const [courtTeams, setCourtTeams] = useState<Map<string, CourtTeam>>(new Map());
    const [courtMatchesPlaying, setCourtMatchesPlaying] = useState<CourtMatch[]>([]);
    const [courtMatchesNext, setCourtMatchesNext] = useState<CourtMatch[]>([]);

    const navigate = useNavigate();

    function openUserProfile(userHeader: UserHeader){
        if(userHeader.id.includes("guest"))
            return;

        const params = new URLSearchParams(location.search);
        params.set("previewuser", userHeader?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    function teamWins(matchId: string, teamWinId: string, teamLoseId: string){
        const winningTeam = courtTeams.get(teamWinId);
        const losingTeam = courtTeams.get(teamLoseId);
  
        winningTeam?.teamPlayers.forEach((winningPlayer) => {
            winningPlayer.gamesPlayed++;
            winningPlayer.wins++;

            if(!isSingles)
                losingTeam?.teamPlayers.forEach((player) => 
                    winningPlayer.usersNotPlayed = winningPlayer.usersNotPlayed?.filter((pid) => pid !== player.userHeader.id)
                );
        });
        
        losingTeam?.teamPlayers.forEach((losingPlayer) => {
            losingPlayer.gamesPlayed++;

            if(!isSingles)
                winningTeam?.teamPlayers.forEach((player) => 
                    losingPlayer.usersNotPlayed = losingPlayer.usersNotPlayed?.filter((pid) => pid !== player.userHeader.id)
                );
        });

        if(isSingles){
            if(winningTeam) 
                winningTeam.teamsNotPlayed = winningTeam?.teamsNotPlayed?.filter((teamId) => losingTeam?.id !== teamId);
            
            if(losingTeam) 
                losingTeam.teamsNotPlayed = losingTeam?.teamsNotPlayed?.filter((teamId) => winningTeam?.id !== teamId);
        }

        updateCourtPlayersCache([
            ...(winningTeam?.teamPlayers ? winningTeam.teamPlayers : []),
            ...(losingTeam?.teamPlayers ? losingTeam?.teamPlayers : [])
        ]);

        setCourtMatchesPlaying((prevPlaying) => {
            const updatedPlaying = prevPlaying.filter((match) => match.id !== matchId);

            setCourtMatchesNext((prevNext) => {
                const queue = [...prevNext];
                const nextMatch = queue.shift();

                if(nextMatch && updatedPlaying.length < numCourts)
                    updatedPlaying.push(nextMatch);

                const newMatch = determineNextMatch();

                if(newMatch)
                    queue.push(newMatch);

                return queue;
            });

            return updatedPlaying;
        });
    }

    function determineNextMatch(){
        if(isSingles){
            const teamsMatchesPlayedAsc = Array.from(courtTeams.values()).sort((a, b) => a.teamPlayers[0].gamesPlayed - b.teamPlayers[0].gamesPlayed);

            if(teamsMatchesPlayedAsc.length < 2)
                return;

            const teamOne = teamsMatchesPlayedAsc[0];
            let teamOneOpponent: CourtTeam | null = null;

            teamOneOpponent = findTeamOpponent(teamsMatchesPlayedAsc, teamOne, teamOneOpponent);

            if(!teamOneOpponent)
                throw new Error('zach made a terrible mistake');

            const match: CourtMatch = {
                teamOne: teamOne,
                teamTwo: teamOneOpponent,
                id: crypto.randomUUID()
            }

            return match;
        } else {
            const playerMatchesPlayedAsc = [...courtPlayers].sort((a, b) => a.gamesPlayed - b.gamesPlayed);

            if(playerMatchesPlayedAsc.length < 4)
                return;

            const teamOnePlayerOne = playerMatchesPlayedAsc[0];
            let teamOnePlayerTwo: CourtPlayer | null = null;
            let teamTwoPlayers: (CourtPlayer | null)[] = [];

            for(let i = 0; i < 2; i++){
                teamTwoPlayers[i] = findPlayerOpponent(playerMatchesPlayedAsc, teamOnePlayerOne, teamTwoPlayers[i]);
            }

            if(!teamTwoPlayers[0])
                throw new Error("zach made a horrible mistake");

            teamOnePlayerTwo = findPlayerOpponent(playerMatchesPlayedAsc, teamTwoPlayers[0], teamOnePlayerTwo, teamOnePlayerOne.userHeader.id);
            if(teamTwoPlayers[1] && teamOnePlayerTwo)
                teamTwoPlayers[1].usersNotPlayed = teamTwoPlayers[1].usersNotPlayed?.filter((pid) => pid !== teamOnePlayerTwo.userHeader.id);

            const match: CourtMatch = {
                id: crypto.randomUUID(),
                teamOne: { id: crypto.randomUUID(), teamName: null, teamPlayers: [teamOnePlayerOne, ...(teamOnePlayerTwo ? [teamOnePlayerTwo] : [])] },
                teamTwo: { id: crypto.randomUUID(), teamName: null, teamPlayers: teamTwoPlayers.filter((p) => p !== null) }
            };

            setCourtTeams((ct) => {
                const newCourtTeams = new Map(ct);

                newCourtTeams.set(match.teamOne.id, match.teamOne);
                newCourtTeams.set(match.teamTwo.id, match.teamTwo);

                return newCourtTeams;
            })
            return match;
        }
    }

    function findTeamOpponent(descTeams: CourtTeam[], teamSearchingFor: CourtTeam, teamToReplace: CourtTeam | null){
        if(teamSearchingFor.teamsNotPlayed?.length === 0){
            teamSearchingFor.teamsNotPlayed = Array.from(courtTeams.keys());
            teamSearchingFor.teamsNotPlayed = teamSearchingFor.teamsNotPlayed.filter((teamId) => teamId !== teamSearchingFor.id);
        }

        for(const teams of descTeams){
            if(teamSearchingFor.teamsNotPlayed?.includes(teams.id) && 
                teams.id !== teamSearchingFor.id && 
                courtTeams.has(teams.id)
            ){
                teamToReplace = teams;
                teamSearchingFor.teamsNotPlayed = teamSearchingFor.teamsNotPlayed.filter((team) => team !== teamToReplace?.id);
                teamToReplace.teamsNotPlayed = teamToReplace.teamsNotPlayed?.filter((team) => team !== teamSearchingFor.id);
                break;
            }
        }

        return teamToReplace;
    }

    function findPlayerOpponent(descPlayers: CourtPlayer[], playerSearchingFor: CourtPlayer, playerToReplace: CourtPlayer | null, oppsTeammateId?: string){
        if(playerSearchingFor.usersNotPlayed?.length === 0){
            playerSearchingFor.usersNotPlayed = Array.from(courtPlayers.map((p) => p.userHeader.id));
            playerSearchingFor.usersNotPlayed = playerSearchingFor.usersNotPlayed.filter((pid) => pid !== playerSearchingFor.userHeader.id);
        }

        const courtPlayersIds = courtPlayers.map((p) => p.userHeader.id);
        for(const player of descPlayers){
            if(playerSearchingFor.usersNotPlayed?.includes(player.userHeader.id) && 
                player.userHeader.id !== playerSearchingFor.userHeader.id &&
                courtPlayersIds.includes(player.userHeader.id) &&
                player.userHeader.id !== oppsTeammateId
            ){
                playerToReplace = player;
                playerToReplace.usersNotPlayed = playerToReplace.usersNotPlayed?.filter((pid) => pid !== playerSearchingFor.userHeader.id);
                playerSearchingFor.usersNotPlayed = playerSearchingFor.usersNotPlayed.filter((pid) => pid !== playerToReplace?.userHeader.id);
                break;
            }
        }

        return playerToReplace;
    }

    function fillMatches(){
        let playing = [...courtMatchesPlaying];
        let queue = [...courtMatchesNext];

        while(playing.length < numCourts){
            const match = determineNextMatch();

            if(!match)
                break;

            playing.push(match);
        }

        while(queue.length < numCourts){
            const match = determineNextMatch();

            if(!match)
                break;

            queue.push(match);
        }

        setCourtMatchesPlaying(playing);
        setCourtMatchesNext(queue);
    }

    function updateCourtPlayersCache(courtPlayers: CourtPlayer[]){
        courtPlayers.forEach((courtPlayer) => saveToCache(`court-player-${courtPlayer.userHeader.id}`, courtPlayer, 48));
    }

    function splitCourtTeams(cTeams: Map<string, CourtTeam>){
        for(const courtTeam of cTeams.values()){
            if(!courtTeam.teamPlayers[1])
                continue;

            const otherPlayer = courtTeam.teamPlayers[1];

            courtTeam.teamPlayers = [courtTeam.teamPlayers[0]];

            const otherPlayerTeam: CourtTeam = {
                id: otherPlayer.userHeader.id,
                teamName: null,
                teamPlayers: [otherPlayer],
                teamsNotPlayed: Array.from(courtTeams.keys())
            };

            cTeams.set(otherPlayerTeam.id, otherPlayerTeam);
        }

        return cTeams;
    }

    useEffect(() => {
        let newCourtTeams: Map<string, CourtTeam> = new Map(courtTeams);
        if(isSingles){
            newCourtTeams = splitCourtTeams(newCourtTeams);
            for(const player of courtPlayers){
                if(!newCourtTeams.has(player.userHeader.id)){
                    const playerTeam: CourtTeam = {
                        id: player.userHeader.id,
                        teamName: null,
                        teamPlayers: [player],
                        teamsNotPlayed: Array.from(courtTeams.keys())
                    };

                    playerTeam.teamsNotPlayed = playerTeam.teamsNotPlayed?.filter((teamId) => teamId !== playerTeam.id);
                    newCourtTeams.set(playerTeam.id, playerTeam);
                }
            }

            if(newCourtTeams.size > courtPlayers.length){
                const courtTeamKeys = Array.from(newCourtTeams.keys());
                const courtPlayerIds = courtPlayers.map((player) => player.userHeader.id);

                for(const playerId of courtTeamKeys){
                    if(!courtPlayerIds.includes(playerId)){
                        newCourtTeams.delete(playerId);
                    }
                }
            }
        } else {
            const playersInTeams: Set<string> = new Set();
            let teamsNotEnough: string[] = [];

            for(const [teamKey, teams] of courtTeams){
                for(let i = 0; i < 2; i++){
                    if(teams.teamPlayers[i])
                        playersInTeams.add(teams.teamPlayers[i].userHeader.id);
                    else {
                        teamsNotEnough.push(teamKey);
                        break;
                    }
                }
            }

            for(const player of courtPlayers){
                if(playersInTeams.has(player.userHeader.id))
                    return;

                if(teamsNotEnough.length === 0){
                    const newTeam: CourtTeam = {
                        id: crypto.randomUUID(),
                        teamName: null,
                        teamPlayers: [player]
                    }

                    teamsNotEnough.push(newTeam.id);
                    newCourtTeams.set(newTeam.id, newTeam);
                } else {
                    const lackingTeamId = teamsNotEnough.shift();
                    let lackingTeam;
                    if(lackingTeamId)
                        lackingTeam = newCourtTeams.get(lackingTeamId);

                    lackingTeam?.teamPlayers.push(player);
                }

                player.usersNotPlayed = Array.from(courtPlayers.map((p) => p.userHeader.id));
                player.usersNotPlayed = player.usersNotPlayed.filter((pid) => pid !== player.userHeader.id);
            }
        }

        setCourtTeams(newCourtTeams);
    }, [courtPlayers, isSingles]);

    useEffect(() => {
        if(courtTeams.size === 0)
            return;

        fillMatches();
    }, [courtTeams, numCourts]);

    let courtContent = <>
        <div>
            <h4>Playing</h4>
            <div className="courts-comp-cont">
                { courtMatchesPlaying.map((match, i) => 
                    <CourtComp 
                        matchId={ match.id }
                        teamOne={ match.teamOne }
                        teamTwo={ match.teamTwo }
                        teamWins={ teamWins }
                        courtNumber={ i }
                        isPlaying={ true }
                        key={ match.id }
                    />
                )}
            </div>
        </div>
        <div>
            <h4>Up Next</h4>
            <div className="courts-comp-cont">
                { courtMatchesNext.map((match, i) => 
                    <CourtComp 
                        matchId={ match.id }
                        teamOne={ match.teamOne }
                        teamTwo={ match.teamTwo }
                        teamWins={ teamWins }
                        courtNumber={ i }
                        isPlaying={ false }
                        key={ match.id }
                    />
                )}
            </div>
        </div>
    </>

    return (
        <div className="court-open-play-comp">
            { (isSingles && courtPlayers.length < 2) || (!isSingles && courtPlayers.length < 4)
                ? <h5 className="not-enough-players">Not Enough Players</h5>
                : courtContent
            }
            <div>
                <h4>Leaderboard</h4>
                <div className="leaderboard">
                    <div className="leaderboard-row leaderboard-header">
                        <div className="left">
                            <h5 className="hidden">1.</h5>
                            <h5>Player</h5>
                        </div>
                        <h5>Wins</h5>
                    </div>
                    { [...courtPlayers].sort((a, b) => b.wins - a.wins).map((player, i) => 
                        <div className={`leaderboard-row ${i % 2 ? "even" : "odd"}`} key={ `leaderboard-${player.userHeader.id}` } >
                            <div className="left">
                                <h5>{ i + 1 }.</h5>
                                <h5 
                                    className="username"
                                    onClick={ () => openUserProfile(player.userHeader) }
                                >{ player.userHeader.username }</h5>
                            </div>
                            <h5>{ player.wins }</h5>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}