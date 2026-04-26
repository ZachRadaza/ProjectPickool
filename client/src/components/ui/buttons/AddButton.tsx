import "./AddButton.css";

type AddButtonProp = {
    onBtnClick: () => void;
    additionalClasses?: string;
    isMini?: boolean;
};

export default function AddButton({ onBtnClick, additionalClasses, isMini }: AddButtonProp){
    return (
        <div className="add-btn-cont">
            <button
                onClick={ () => onBtnClick() }
                className={`add-btn ${additionalClasses} ${ isMini ? "mini" : ""}`}
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5L4.99998 19M5.00001 5L19 19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            { isMini &&
                <h6 className="filler">_</h6>
            }
        </div>
    );
}