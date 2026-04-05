import "./CloseButton.css";

type CloseButtonProp = {
    setIsClosed: (close: boolean) => void;
};

export default function CloseButton({ setIsClosed }: CloseButtonProp){
    return (
        <button 
            className="close ui"
            onClick={ () => setIsClosed(true) }
        >
            X
        </button>
    );
}