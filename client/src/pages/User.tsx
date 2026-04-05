import type { Users } from "../utils/schemas";
import { useOutletContext, useParams } from "react-router-dom";
import UserInfoComp from "../components/pages/user/UserInfoComp";
import { useEffect, useState } from "react";
import "./User.css";
import { ExtensionService } from "../utils/ExtensionService";
import UserContentComp from "../components/pages/user/UserContentComp";
import Loading from "./Loading";
import ErrorPage from "./Error";
import NoUserOverlay from "../components/ui/NoUserOverlay";

type UserContext = {
    user: Users | null;
    setClosedSignUp: (closed: boolean) => void;
    setClosedSignIn: (closed: boolean) => void;
    updateUserInfo: (id: string, user: Partial<Users>) => Promise<void>;
};

export default function User(){
    const {
        user,
        setClosedSignIn,
        setClosedSignUp,
        updateUserInfo
    } = useOutletContext<UserContext>();
    const { id } = useParams();

    const [openedUser, setOpenedUser] = useState<Users | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUser();

        async function fetchUser(){
            try{
                setIsLoading(true);
                if(id?.trim() === "guest" || !id){
                    setIsLoading(false);
                    return;
                }

                const data = await ExtensionService.getUser(id);

                if(!data){
                    setIsLoading(false);
                    setError("Please Contact Support");
                    return;
                }

                setOpenedUser(data);
                setIsLoading(false);
            } catch(errors){
                setError("Please Contact Support");
                setIsLoading(false);
            }
        }
    }, [id]);

    if(isLoading)
        return <Loading />;

    if(error)
        return <ErrorPage error={ error }/>

    return (
        <div className="user-page">
            { !user
                ? <NoUserOverlay setClosedSignIn={ setClosedSignIn } setClosedSignUp={ setClosedSignUp } />
                : <></>
            }
            <UserInfoComp loadedUser={ openedUser } selfUser={ user } updateUserInfo={ updateUserInfo } />
            <UserContentComp user={ openedUser } />
        </div>
    );
}