import { useState } from "react";
import UserTabClubsComp from "./UserTabClubsComp";
import UserTabPostsComp from "./UserTabPostsComp";
import type { Users } from "../../../utils/schemas";

export const TabType = {
    CLUBS: "clubs",
    POSTS: "posts"
} as const;

export type TabType = (typeof TabType)[keyof typeof TabType];

type UserContentCompProp = {
    user: Users | null;
};

export default function UserContentComp({ user }: UserContentCompProp){
    const [currentTab, setCurrentTab] = useState<TabType>();
    const tabMap = {
        [TabType.CLUBS]: <UserTabClubsComp />,
        [TabType.POSTS]: <UserTabPostsComp />,
    };

    return (
        <div className="user-content-comp">
            <div className="content">
                { currentTab ? tabMap[currentTab] : null }
            </div>
            <div className="tabs">
                <button
                    onClick={() => setCurrentTab(TabType.CLUBS)}    
                >Clubs</button>
                <button
                    onClick={() => setCurrentTab(TabType.POSTS)}
                >Posts</button>
            </div>
        </div>
    );
}