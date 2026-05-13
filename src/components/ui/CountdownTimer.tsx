import { useEffect, useState } from "react";

type CountdownTimerProp = {
    lengthLeftSeconds: number | null;
    timerStartsAt: string | null;
};

export default function CountdownTimer({ lengthLeftSeconds, timerStartsAt }: CountdownTimerProp){
    const [timeLeft, setTimeLeft] = useState<number | null>(() => getTimeLeftMs(timerStartsAt, lengthLeftSeconds));
 
    function getTimeLeftMs(timerStartsAt: string | null, lengthLeftSeconds: number | null) {
        if(!timerStartsAt || lengthLeftSeconds == null) 
            return null;

        const approvedMs = new Date(timerStartsAt).getTime();
        const deadlineMs = approvedMs + lengthLeftSeconds * 1000;

        return Math.max(0, deadlineMs - Date.now());
    }

    function formatTimeLeft(ms: number | null) {
        if(ms == null) 
            return "";

        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    useEffect(() => {
        setTimeLeft(getTimeLeftMs(timerStartsAt, lengthLeftSeconds));

        if(!timerStartsAt || lengthLeftSeconds == null) 
            return;

        const interval = window.setInterval(() => {
            setTimeLeft(getTimeLeftMs(timerStartsAt, lengthLeftSeconds));
        }, 1000);

        return () => window.clearInterval(interval);
    }, [timerStartsAt, lengthLeftSeconds]);

    return formatTimeLeft(timeLeft); 
}