import { useState, useEffect } from "react";
import { ExtensionService } from "../../../utils/ExtensionService";
import { wait } from "../../../utils/random";
import "../popup.css";
import "./SignActionPopup.css";
import { useNavigate } from "react-router-dom";
import CloseButton from "../../ui/buttons/CloseButton";

const MessageType = {
    NONE: "",
    SUCCESS: "Successfully Logged In",
    INCORRECT: "Incorrect email or password",
    EMPTY: "Please enter the fields"
} as const;

type MessageType = (typeof MessageType)[keyof typeof MessageType];

type SignInPopupProp = {
    isClosed: boolean;
    setIsClosed: (closed: boolean) => void;
};

export default function SignUpPopup({ isClosed, setIsClosed }: SignInPopupProp){
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [buttonContent, setButtonContent] = useState<string>("Login");
    const [valid, setValid] = useState<MessageType>(MessageType.NONE);
    const navigate = useNavigate();
    
    function verifyInputs(){
        return (email && password);
    }

    async function btnClicked(){
        if(!verifyInputs()){
            setValid(MessageType.EMPTY);
            return;
        }

        setButtonContent("Loggin In...");

        const data = await ExtensionService.loginUser(email.trim(), password.trim())

        if(data){
            setValid(MessageType.SUCCESS);
        
            await wait(2000);

            setIsClosed(true);

            navigate("/home");
            window.location.reload();
        } else {
            setValid(MessageType.INCORRECT);
            setPassword("");
        }

        setButtonContent("Login");
    }

    useEffect(() => {
        setEmail("");
        setPassword("");
        setValid(MessageType.NONE);
    }, [isClosed]);

    return (
        <div className="container">
            <div className={ `popup sign-action ${isClosed ? "closed" : ""}`}>
                <CloseButton setIsClosed={ setIsClosed } />
                <div className="titles-cont">
                    <h4 className="title">Sign In</h4>
                    <h6 className="subtitle">Welcome Back to the Project</h6>
                </div>
                <div className="content">
                    <p 
                        className={ valid === MessageType.SUCCESS ? "message" : "message invalid" }
                    >
                        { valid }
                    </p>
                    <div className="input-pair">
                        <h6>Email</h6>
                        <input
                            value={ email }
                            onChange={ (event) => setEmail(event.target.value) }
                            type="email"
                            placeholder="name@email.com"
                        />
                    </div>                
                    <div className="input-pair">
                        <h6>Password</h6>
                        <input
                            value={ password }
                            onChange={ (event) => setPassword(event.target.value) }
                            type="password"
                            placeholder="A winners passord"
                        />
                    </div>
                    <button
                        onClick={ () =>  btnClicked()}
                    >
                        { buttonContent }
                    </button>
                </div>
            </div>
        </div>
    )
}