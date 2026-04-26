import { ExtensionService } from "../../../utils/ExtensionService";
import { Role, type Club_Members, type Events, type Hosts, type Players } from "../../../utils/schemas";
import UsersDropdown from "../user/UsersDropdown";
import "./EventParticipantsComp.css";

type EventUsersCompProp = {
    event: Events | null;
    userMember: Club_Members | null;
    hosts: Hosts[];
    playersApproved: Players[];
    playersNotApproved: Players[];
    setSearchHostsClosed: (closed: boolean) => void;
    userIsHost: boolean;
    setPlayersNotApproved: React.Dispatch<React.SetStateAction<Players[]>>;
    setPlayersApproved: React.Dispatch<React.SetStateAction<Players[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>
}

export default function EventParticipantsComp({ 
    event, 
    hosts, 
    playersApproved, 
    playersNotApproved, 
    userMember, 
    setSearchHostsClosed, 
    userIsHost,
    setPlayersApproved,
    setPlayersNotApproved,
    setError
}: EventUsersCompProp){
    async function approveRequest(memberId: string){
        if(!event?.id || !memberId)
            return;

        const paid = event.price !== null && event.price <= 0;
        const updates: Partial<Players> = { approved: true, paid };

        const approved = await ExtensionService.updatePlayer(event?.id, memberId, updates);

        if(!approved){
            setError("Error in approving player");
            return;
        }

        setPlayersNotApproved(playersNotApproved.filter((p) => p.user!.id !== memberId));
        setPlayersApproved([...playersApproved, approved]);
    }

    async function denyRequest(memberId: string){
        if(!event?.id || !memberId)
            return;

        const denied = await ExtensionService.deletePlayer(event.id, memberId);

        if(!denied){
            setError("Error in denying player");
            return;
        }

        setPlayersNotApproved(playersNotApproved.filter((p) => p.user!.id !== memberId));
    }

    return (
        <>
            <div className="player-dropdown-conts">
                <UsersDropdown
                    content="Hosts"
                    users={ hosts.map((host) => host.user!) }
                    showNum={ true }
                    isMini={ true }
                    addButton={ userMember?.role === Role.ADMIN || userMember?.role === Role.OWNER || userIsHost }
                    onAddBtnClick={ () => setSearchHostsClosed(false) }
                />
            </div>
            { playersApproved.length > 0 &&
                <div className="player-dropdown-conts">
                    <UsersDropdown 
                        content={ `Current Players${ playersApproved.length >= (event?.max_players ?? 100) ? " (Full)" : ""}` }
                        users={ playersApproved.map((player) => ({ ...player.user!, paid: player.paid })) }
                        showNum={ true }
                        isMini={ true }
                        showUnpaid={ true }
                    />
                </div>
            }
            { playersNotApproved.length > 0 &&
                <div className="player-dropdown-conts">
                    { userMember?.role === Role.OWNER || hosts.some((host) => host.user?.id === userMember?.user.id)
                        ? <UsersDropdown 
                            content="Requested"
                            showNum={ true }
                            users={ playersNotApproved.map((player) => player.user!) }
                            isMini={ false }
                            appovedClicked={ (id: string) => approveRequest(id) }
                            denyClicked={ (id: string) => denyRequest(id) }
                            isDisabled={ playersApproved.length >= (event?.max_players ?? 100) }
                        />
                        : <UsersDropdown 
                            content="Requested"
                            showNum={ true }
                            users={ playersNotApproved.map((player) => player.user!) }
                            isMini={ true }
                        />
                    }
                </div>
            }
        </>
    )
}