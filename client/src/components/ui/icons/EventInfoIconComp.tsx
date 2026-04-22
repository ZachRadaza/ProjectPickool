import { capitalizeWords } from "../../../utils/random";
import type { Level, Sex } from "../../../utils/schemas";

type EventInfoIconCompProp = {
    isSingles: boolean;
    isTournament: boolean;
    isDUPR: boolean;
    sex: Sex;
    level: Level;
};

export default function EventInfoIconComp({ isSingles, isTournament, isDUPR, sex, level }:EventInfoIconCompProp){
    return (
        <div className="icon-comp-cont">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.6 -3.2 35.2 43.2">
                <path d="M5.99,28.46l-.81,.81c-.3,.3-.78,.3-1.08,0l-1.37-1.37c-.3-.3-.3-.78,0-1.08l.85-.85c.08-.08,.2-.08,.28,0l3.52-3.52,2.17,2.17-3.52,3.52s.06,.22-.04,.32Z"/>
                <path d="M28.05,15.49l-6.42,6.42c-1.58,1.58-3.96,1.86-5.82,.84h0c-2.73-.99-4.14,.42-4.14,.42l-.37,.37c-.21,.21-.55,.21-.77,0l-2.07-2.07c-.21-.21-.21-.55,0-.77l.37-.37s1.41-1.42,.42-4.14h0c-1.02-1.86-.74-4.25,.84-5.82l6.42-6.42c1.92-1.92,5.03-1.92,6.95,0l4.6,4.6c1.92,1.92,1.92,5.03,0,6.95Z"/>
            </svg>
            <div className="right-side">
                <h6 className="name">{isSingles ? "Singles" : "Doubles"} { isTournament ? "Tournament" : "Casual" }</h6>
                <p className="bottom">{ isDUPR ? "DUPR •" : "" } { capitalizeWords(sex) } • { capitalizeWords(level) }</p>
            </div>
        </div>
    );
}