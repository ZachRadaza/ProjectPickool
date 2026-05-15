import type { Dispatch, SetStateAction } from "react";
import CloseButton from "../../components/ui/buttons/CloseButton";
import Button from "../../components/ui/buttons/Button";
import "./NoUserPopup.css";

type NoUserPopupProp = {
    setClosedSignUp: Dispatch<SetStateAction<boolean>>;
    setClosedSignIn: Dispatch<SetStateAction<boolean>>;
    setIsClosed: Dispatch<SetStateAction<boolean>>;
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