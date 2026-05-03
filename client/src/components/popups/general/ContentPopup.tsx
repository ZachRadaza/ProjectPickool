import "./ContentPopup.css";

type ContentPopupProp = {
    title: string;
    body?: string;
    isRed?: boolean;
}

export default function ContentPopup({ title, body, isRed }: ContentPopupProp){
    return (
        <div className="content-popup popup">
            <h3 className={ isRed ? "red" : "" }>{ title }</h3>
            { body && <p>body</p> }
        </div>
    );
}