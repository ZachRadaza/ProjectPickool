import Button from "./buttons/Button";
import "./NoUserOverlay.css";

type NoUserOverlayProp = {
    setClosedSignUp: (close: boolean) => void;
    setClosedSignIn: (close: boolean) => void;
}

export default function NoUserOverlay({ setClosedSignIn, setClosedSignUp}: NoUserOverlayProp){
    return (
        <div className="no-user-overlay">
            <h3>We notice you dont have an account</h3>
            <div className="sign-btns-cont">
                <Button 
                    onBtnClick={ () => {
                        setClosedSignUp(false);
                        setClosedSignIn(true)
                    }}
                    content="Create Account"
                />
                <Button
                    onBtnClick={ () => {
                        setClosedSignIn(false);
                        setClosedSignUp(true);
                    }}
                    content="Login"
                />             
            </div>
        </div>
    );
}