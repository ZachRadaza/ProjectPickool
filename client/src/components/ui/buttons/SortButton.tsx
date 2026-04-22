import "./SortButton.css";

type SortButtonProp = {
    onBtnClick: () => void;
    additionalClasses?: string;
};

export default function SortButton({ onBtnClick, additionalClasses }: SortButtonProp){
    return (
        <button className={`sort-btn ${additionalClasses}`} onClick={ () => onBtnClick() }>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 8H13" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 13H13" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 18H13" strokeWidth="2" strokeLinecap="round"/>
                <path d="M17 20V4L20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    );
}