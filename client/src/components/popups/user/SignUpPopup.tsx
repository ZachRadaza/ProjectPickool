import { useState, useEffect } from "react";
import { ExtensionService } from "../../../utils/ExtensionService";
import type { Users } from "../../../utils/schemas";
import { wait } from "../../../utils/random";
import "../popup.css";
import "./SignActionPopup.css";
import CloseButton from "../../ui/buttons/CloseButton";

const MessageType = {
    NONE: "",
    SUCCESS: "Account Successfully Created",
    INCORRECT: "Email or Password in Use",
    EMPTY: "Please Enter All the Fields",
    USERNAMELENGTH: "Username must be 5-20 Characters",
    PASSWORDLENGTH: "Password must be atleast 5 Characters"
} as const;

type MessageType = (typeof MessageType)[keyof typeof MessageType];

type SignUpPopupProp = {
    isClosed: boolean;
    setIsClosed: (closed: boolean) => void;
};

export default function SignUpPopup({ isClosed, setIsClosed }: SignUpPopupProp ){
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [buttonContent, setButtonContent] = useState<string>("Create Account");
    const [valid, setValid] = useState<MessageType>(MessageType.NONE);

    function verifyInputs(){
        return (email && password && username);
    }

    async function btnClicked(){
        if(!verifyInputs()){
            setValid(MessageType.EMPTY);
            return;
        }

        if(!(username.length >= 5 && username.length < 20)){
            setValid(MessageType.USERNAMELENGTH);
            return;
        }

        if(password.length < 5){
            setValid(MessageType.PASSWORDLENGTH);
            return;
        }

        setButtonContent("Creating Account...");

        const user: Users = {
            id: null,
            username: username.trim(),
            email: email.trim()
        };

        const data = await ExtensionService.addUser(user, password);

        if(data) {  
            setValid(MessageType.SUCCESS);
            
            await wait(2000);
            setIsClosed(true);

            window.location.reload();
        } else {
            setValid(MessageType.INCORRECT);
            setPassword("");
        }

        setButtonContent("Create Account");
    }

    useEffect(() => {
        setEmail("");
        setPassword("");
        setUsername("");
        setValid(MessageType.NONE);
    }, [isClosed]);

    return (
        <div className="container">
            <div className={ `popup sign-action ${isClosed ? "closed" : ""}`}>
                <CloseButton setIsClosed={ setIsClosed } />
                <div className="titles-cont">
                    <h4 className="title">Create Account</h4>
                    <h6 className="subtitle">Join the Project</h6>
                </div>
                <div className="content">
                    <p 
                        className={ valid === MessageType.SUCCESS ? "message" : "message invalid" }
                    >
                        { valid }
                    </p>
                    <div className="input-pair">
                        <h6>Username</h6>
                        <input
                            value={ username }
                            onChange={ (event) => setUsername(event.target.value) }
                            type="text"
                            placeholder="MrPickle"
                        />
                    </div>
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