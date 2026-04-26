import { useEffect, useRef, useState } from "react";
import type { UserHeader } from "../../../utils/schemas";
import DropdownButton from "../../ui/buttons/DropdownButton";
import UserHeaderMiniComp from "../../ui/core/UserHeaderMiniComp";
import "./UsersDropdown.css";
import UserHeaderComp from "../../ui/core/UserHeaderComp";
import CircleAddButton from "../../ui/buttons/AddButton";

type ShrunkPlayer = UserHeader & {
    paid?: boolean;
}

type UsersDropdownProp = {
    users: ShrunkPlayer[];
    isMini?: boolean;
    content: string;
    showNum?: boolean;
    appovedClicked?: (id: string) => void;
    denyClicked?: (id: string) => void;
    isDisabled?: boolean;
    addButton?: boolean;
    onAddBtnClick?: () => void;
    showUnpaid?: boolean;
};

export default function UsersDropdown({ 
    users, 
    isMini, 
    content, 
    showNum, 
    appovedClicked, 
    denyClicked, 
    isDisabled, 
    addButton, 
    onAddBtnClick,
    showUnpaid
}: UsersDropdownProp){
    const [isClosed, setIsClosed] = useState<boolean>(false);
    const [compHeight, setCompHeight] = useState<number>(0);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(!isClosed && ref.current)
            setCompHeight(ref.current.scrollHeight);
        else
            setCompHeight(0);
    }, [isClosed]);

    return (
        <div className="users-dropdown-cont">
            <DropdownButton
                onBtnClick={ () => setIsClosed(!isClosed) }
                content={ `${content}${showNum ? ` (${users.length})` : ""}`}
                isClosed={ isClosed }
            />
            { users &&
                <div 
                    className={ `dropdown ${isClosed ? "" : "active"} ${isMini ? "mini" : ""}` }
                    ref={ ref }
                    style={{ height: compHeight }}
                >
                    { users.map((user) => 
                        isMini
                            ? <UserHeaderMiniComp userHeader={ user } showUnpaid={ !user.paid && showUnpaid } key={ user.id } />
                            : <UserHeaderComp 
                                userHeader={ user } 
                                approveClicked={ () => appovedClicked && appovedClicked(user.id) }  
                                denyClicked={ () => denyClicked && denyClicked(user.id) }  
                                key={ user.id } 
                                disableBtns={ isDisabled }
                            />
                    )}
                    { (addButton && onAddBtnClick) &&
                        <CircleAddButton 
                            onBtnClick={ () => onAddBtnClick() }
                            isMini={ isMini }
                        />
                    }
                </div>
            }
        </div>
    );
}