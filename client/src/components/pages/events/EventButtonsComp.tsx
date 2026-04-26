import { useEffect, useMemo, useState } from "react";
import { EventButtonSituation, Role, type Club_Members, type Events, type Players } from "../../../utils/schemas";
import Button from "../../ui/buttons/Button";
import GCashButton from "../../ui/buttons/GCashButton";
import { ExtensionService } from "../../../utils/ExtensionService";
import "./EventButtonComp.css";
import CountdownTimer from "../../ui/CountdownTimer";

type EventButtonCompProp = {
    event: Events | null;
    userMember: Club_Members | null;
    buttonSituation: EventButtonSituation;
    userIsHost: boolean;
    playersApproved: Players[];
    playersNotApproved: Players[];
    openClub: () => void;
    setError: React.Dispatch<React.SetStateAction<string | null>>
    setPlayersApproved: React.Dispatch<React.SetStateAction<Players[]>>;
    setPlayersNotApproved: React.Dispatch<React.SetStateAction<Players[]>>;
};

export default function EventButtonComp({ 
    userMember, 
    event, 
    playersApproved,
    playersNotApproved,
    buttonSituation, 
    userIsHost,
    openClub,
    setError, 
    setPlayersApproved, 
    setPlayersNotApproved,
}: EventButtonCompProp){
    const [joining, setJoining] = useState<boolean>(false);
    const [now, setNow] = useState(() => Date.now());

    const message = useMemo(() => {
        switch(buttonSituation){
            case EventButtonSituation.COMPLETE:
                return "Already Joined Event";
            case EventButtonSituation.JOINED:
                return "You have been approved, pay to join";
            case EventButtonSituation.REQUESTED:
                return "Already Requested Event";
            case EventButtonSituation.NOT_MEMBER:
            default:
                return "You must be a member of the club to join";
        }
    }, [buttonSituation]);

    const userPlayer = useMemo(() => {
        for(const player of playersApproved){
            if(player.user?.id === userMember?.user.id)
                return player;
        }

        return null;
    }, [playersApproved, userMember]);

    const isDisabled = userPlayer?.approved_at && event?.approve_window != null
        ? now >
          new Date(userPlayer.approved_at).getTime() +
            event.approve_window * 1000
        : false;

    async function joinEvent(){
        if(!userMember?.user|| !event?.id){
            setError("Cant join event, not a member");
            return;
        }

        setJoining(true);
        let approved = userMember.role === Role.OWNER || event.is_auto_approve || userIsHost;
        let paid = approved; 
        const player = await ExtensionService.addPlayer(event.id, userMember.user.id, approved, paid);

        if(!player){
            setError("Error in joining Event");
            setJoining(false);
            return;
        }

        if(approved)
            setPlayersApproved([...playersApproved, player]);
        else
            setPlayersNotApproved([...playersNotApproved, player]);
        
        setJoining(false);
    }

    async function payToJoinEvent(){
        if(!userMember?.user|| !event?.id){
            setError("Cant join event, not a member");
            return;
        }

        const player = await ExtensionService.updatePlayer(event.id, userMember.user.id, { paid: true });

        if(!player){
            setError("Error in joining Event");
            setJoining(false);
            return;
        }

        setPlayersApproved((prev) => [
            ...prev.filter(p => p.user?.id !== player.user?.id),
            player
        ]);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            { userMember && (buttonSituation === EventButtonSituation.MEMBER || buttonSituation === EventButtonSituation.JOINED)
                ? ( 
                    (event?.is_auto_approve && (event.price ? event.price : 0) > 0) ||
                    (event?.price !== 0 && buttonSituation === EventButtonSituation.JOINED)
                )
                    ? <>
                        <GCashButton 
                            onBtnClick={ () => {
                                if(buttonSituation === EventButtonSituation.JOINED)
                                    payToJoinEvent();
                                else
                                    joinEvent();
                            }}
                            isDisabled={ isDisabled }
                        />
                        { buttonSituation === EventButtonSituation.JOINED &&
                            <h6>Pay in <CountdownTimer lengthLeftSeconds={ event?.approve_window ?? 0 } timerStartsAt={ userPlayer?.approved_at || null }/></h6>
                        }
                    </>
                    : <Button
                        content={ joining ? "Joining Event..." : "Join Event" }
                        onBtnClick={() => joinEvent() }
                    />
                : (buttonSituation === EventButtonSituation.NOT_MEMBER)
                    ? <Button 
                        content="Join Club"
                        onBtnClick={ () => openClub() }
                    />
                    : <p className="cant-join-message">*Can't Join - { message ? message : "" }</p>
            }
        </>
    );
}