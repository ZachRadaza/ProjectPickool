import "./CloseButton.css";

type CloseButtonProp = {
    setIsClosed: (close: boolean) => void;
    additionalClasses?: string;
};

export default function CloseButton({ setIsClosed, additionalClasses }: CloseButtonProp){
    return (
        <button 
            className={ `close ui ${additionalClasses}` }
            onClick={ () => setIsClosed(true) }
        >
            <svg className="close-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 5L4.99998 19M5.00001 5L19 19" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </button>
    );
}