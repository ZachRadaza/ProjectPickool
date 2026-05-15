import { useState } from "react";
import { ExtensionService } from "../../utils/ExtensionService";
import { SignUpMessageType, type Users } from "../../utils/schemas";
import "../popup.css";
import "./SignActionPopup.css";
import CloseButton from "../../components/ui/buttons/CloseButton";
import Button from "../../components/ui/buttons/Button";

type SignUpPopupProp = {
    setIsClosed: (closed: boolean) => void;
};

export default function SignUpPopup({ setIsClosed }: SignUpPopupProp ){
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [buttonContent, setButtonContent] = useState<string>("Create Account");
    const [valid, setValid] = useState<SignUpMessageType>(SignUpMessageType.NONE);
    const [resendContent, setResendContent] = useState<string>("Resend verification link to email.");

    let content;

    function verifyInputs(){
        return (email && password && username);
    }

    async function resendVerificaiton(){
        await ExtensionService.UserService.resendEmailUser(email);
        setResendContent("Sent.");
    }

    async function btnClicked(){
        if(!verifyInputs()){
            setValid(SignUpMessageType.EMPTY);
            return;
        }

        if(!(username.length >= 5 && username.length < 20)){
            setValid(SignUpMessageType.USERNAMELENGTH);
            return;
        }

        if(password.length < 5){
            setValid(SignUpMessageType.PASSWORDLENGTH);
            return;
        }

        setButtonContent("Creating Account...");

        const user: Users = {
            id: null,
            username: username.trim(),
            email: email.trim()
        };

        const data = await ExtensionService.UserService.addUser(user, password);

        if(data === SignUpMessageType.EMAILUSED || data === SignUpMessageType.USERNAMEUSED){
            setValid(data);
            setPassword("");
        } else {  
            setValid(SignUpMessageType.SUCCESS);
            /*
            await wait(2000);
            setIsClosed(true);

            window.location.reload();
            */
        }

        setButtonContent("Create Account");
    }

    if(valid === SignUpMessageType.SUCCESS)
        content = <>
            <p>Please check your email for a verification link.</p>
            <p className="did-not-recieve">Did not recieve it?</p>
            <p><a onClick={ () => resendVerificaiton() }>{ resendContent }</a></p>
        </>;
    else
        content = <>
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
            <Button 
                onBtnClick={ () =>  btnClicked() }
                content={ buttonContent }
            />
        </>;

    return (
        <div className="popup sign-action">
            <CloseButton setIsClosed={ setIsClosed } />
            <div className="titles-cont">
                <h4 className="title">Create Account</h4>
                <h6 className="subtitle">Join the Project</h6>
            </div>
            <div className="content">
                <p className={ valid === SignUpMessageType.SUCCESS ? "message" : "message invalid" }>
                    { valid }
                </p>
                { content }
            </div>
        </div>
    )
}