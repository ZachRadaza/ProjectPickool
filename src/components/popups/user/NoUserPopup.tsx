import type { SetStateAction } from "react";
import CloseButton from "../../ui/buttons/CloseButton";
import Button from "../../ui/buttons/Button";
import "./NoUserPopup.css";

type NoUserPopupProp = {
    setClosedSignUp: React.Dispatch<SetStateAction<boolean>>;
    setClosedSignIn: React.Dispatch<SetStateAction<boolean>>;
    setIsClosed: React.Dispatch<SetStateAction<boolean>>;
};

export default function NoUserPopup({ setIsClosed, setClosedSignIn, setClosedSignUp }: NoUserPopupProp){
    return (
        <div className="popup no-user-popup">
            <CloseButton setIsClosed={ setIsClosed }/>
            <h3 className="title">We Notice You Dont Have an Account</h3>
            <div className="sign-buttons">
                <Button 
                    onBtnClick={ () => setClosedSignIn(false) }
                    content="Sign In"
                />
                <Button 
                    onBtnClick={() => setClosedSignUp(false) }
                    content="Create Account"
                />
            </div>
        </div>
    );
}