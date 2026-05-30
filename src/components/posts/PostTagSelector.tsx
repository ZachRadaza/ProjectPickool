import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Club_Members, Post_Tags, Posts, UserHeader } from "../../utils/schemas";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import { ExtensionService } from "../../utils/ExtensionService";
import UserHeaderComp from "../ui/core/UserHeaderComp";
import "./PostTagSelector.css"

type PostTagSelectorProp = {
    post: Posts | null;
    setPost: Dispatch<SetStateAction<Posts | null>>;
    club_id: string | null;
}

export default function PostTagSelector({ post, club_id, setPost }: PostTagSelectorProp){
    const [clubMembers, setClubMembers] = useState<Club_Members[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showSelector, setShowSelector] = useState<boolean>(false);

    function addUsernameTag(username: string){
        if(!post)
            return "";

        const lastAt = post.description.lastIndexOf("@");

        if(lastAt === -1)
            return post.description;

        return post.description.slice(0, lastAt + 1) + username;
    }

    function onClick(selectedUser: UserHeader){
        if(!post)
            return;

        const newDesc = addUsernameTag(selectedUser.username);
        const newTag: Post_Tags = { user_id: selectedUser.id };
        const newPostTags: Post_Tags[] = post?.post_tags
            ? [...post.post_tags, newTag]
            : [newTag];

        setPost((post) => post ? { ...post, description: newDesc, post_tags: newPostTags } : post);

        setClubMembers([]);
        setShowSelector(false);
    }

    async function searchMembers(searchFor: string){
        try{
            if(!club_id)
                return;

            const { data: members } = await ExtensionService.ClubMemberService.getQueryClubMembers(club_id, searchFor, 1);

            setClubMembers(members);
        } catch(error){
            setIsLoading(false);
            setError("Error in seraching club members");            
        }
    }

    useEffect(() => {
        searchDescriptionTag();

        async function searchDescriptionTag(){
            setIsLoading(true);
            const input = setTagInput();
            setShowSelector(!!input);
            await searchMembers(input);
            setIsLoading(false);
        }

        function setTagInput(){
            const trimmed = post?.description.trimEnd() ?? "";
            const lastWord = trimmed.split(/\s+/).pop();

            if(!lastWord?.startsWith("@"))
                return "";

            return lastWord.slice(1);
        }
    }, [post?.description]);

    let content;
    
    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error }/>
    else 
        content = <>
            { clubMembers.length > 0
                ? <>{ clubMembers.map((member) => 
                    <div className="user-header-wrapper" onClick={ () => onClick(member.user) } key={ member.user.id }>
                        <UserHeaderComp userHeader={ member.user } clubInfoHeader={ member } disableBtns={ true }/>
                    </div>
                )}</>
                : <h6 className="no-members">No Club Member Matches Search</h6>
            }
        </>;
    return (
        <>
            { showSelector &&
                <div className="post-tag-selector">
                    { content }
                </div>
            }
        </>
    );
}