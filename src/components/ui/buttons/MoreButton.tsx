import "./MoreButton.css";

type MoreButtonProp = {
    onBtnClick: () => void;
    additionalClasses?: string;
};

export default function MoreButton({ onBtnClick, additionalClasses }: MoreButtonProp){
    return (
        <button
            onClick={ () => onBtnClick() }
            className={ `ui more ${additionalClasses}` }
        >
            <svg className="more-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="12" r="1.5" transform="rotate(90 18 12)"/>
                <circle cx="12" cy="12" r="1.5" transform="rotate(90 12 12)"/>
                <circle cx="6" cy="12" r="1.5" transform="rotate(90 6 12)"/>
            </svg>
        </button>
    );
}