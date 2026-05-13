import Button from "../../ui/buttons/Button";
import CloseButton from "../../ui/buttons/CloseButton";
import "./TwoOptionPopup.css";

type TwoOptionPopupProp = {
    title: string;
    body: string;
    btn1Content: string;
    btn2Content: string;
    btn1Click: () => void;
    btn2Click: () => void;
    btn1Red?: boolean;
    btn2Red?: boolean;
    setIsClosed: (closed: boolean) => void;
};

export default function TwoOptionPopup({ 
    title, 
    body, 
    btn1Content, 
    btn1Click, 
    btn1Red, 
    btn2Content, 
    btn2Click, 
    btn2Red,
    setIsClosed
}: TwoOptionPopupProp){
    return (
        <div className="two-option-popup popup">
            <CloseButton setIsClosed={ setIsClosed } />
            <h3>{ title }</h3>
            <p>{ body }</p>
            <div className="btns-cont">
                <Button 
                    content={ btn1Content }
                    onBtnClick={ () => { btn1Click(); setIsClosed(true) } }
                    additionalClasses={ btn1Red ? "red" : "" }
                />
                <Button 
                    content={ btn2Content }
                    onBtnClick={ () => { btn2Click(); setIsClosed(true) } }
                    additionalClasses={ btn2Red ? "red" : "" }
                />
            </div>
        </div>
    );
}