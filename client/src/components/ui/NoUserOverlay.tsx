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
                <button
                    onClick={ () => {
                        setClosedSignUp(false);
                        setClosedSignIn(true)
                    } }    
                >
                    Create Account
                </button>
                <button
                    onClick={ () => {
                        setClosedSignIn(false);
                        setClosedSignUp(true);
                    }}    
                >
                    Login
                </button>                    
            </div>
        </div>
    );
}