import { useEffect, useState } from "react";
import type { Posts, UserHeader, Users } from "../../utils/schemas";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import PostsComp from "../ui/core/PostsComp";
import PopupWrapper from "../../popups/PopupWrapper";
import ModifyPostsPopup from "../../popups/posts/ModifyPostsPopup";
import { ExtensionService } from "../../utils/ExtensionService";
import Button from "../ui/buttons/Button";
import "./UserTabComp.css";

type UserTabPostsCompProp = {
    userHeader: UserHeader | null;
    user: Users | null;
};

export default function UserTabPostsComp({ userHeader, user }: UserTabPostsCompProp){
    const [posts, setPosts] = useState<Posts[]>([]);
    const [modifyPostIsClosed, setModifyPostIsClosed] = useState<boolean>(true);
    const [currentPostPage, setCurrentPostPage] = useState<number>(1);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);
    const [modifyPostId, setModifyPostId] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    function setIndividualPost(post_id: string, updates: Posts){
        setPosts((posts) => posts.map((post) => post.id === post_id ? updates : post));
    }

    async function getPosts(){
        try{
            if(!user?.id){
                setError("No User");
                return;
            }

            if(!hasMorePosts)
                return;

            const page = currentPostPage;
            const { data: postData, hasMore }= await ExtensionService.PostService.getUserPosts(user?.id, userHeader?.id || null, page);

            setPosts([...posts, ...postData]);
            setCurrentPostPage(page + 1);
            setHasMorePosts(hasMore);
        } catch(error){
            setIsLoading(false);
            setError("Error in fetching posts");
        }
    }

    useEffect(() => {
        getUserPosts();
        async function getUserPosts(){
            setIsLoading(true);

            await getPosts();

            setIsLoading(false);
        }
    }, []);

    if(isLoading)
        return <Loading />;
    else if(error)
        return <ErrorPage error={ error }/>;
    return (
        <>
            <div className="user-tab-posts-cont">
                { posts.length > 0
                    ? <>
                        { posts.map((post) => 
                            <PostsComp 
                                post={ post }
                                userHeader={ userHeader }
                                userClubMember={ null }
                                setPosts={ setPosts }
                                setModifyPostIsClosed={ setModifyPostIsClosed }
                                setPost={ (updated) => setIndividualPost(updated.id!, updated) }
                                setModifyPostId={ setModifyPostId }
                            />
                        )}
                        { hasMorePosts && <Button content="Load More" onBtnClick={ () => getPosts() }/> }
                    </>
                    : <h6>{ userHeader?.username ?? "Guest" }</h6> 
                }
            </div>
            <PopupWrapper 
                isClosed={ modifyPostIsClosed }
                popupComp={ 
                    <ModifyPostsPopup 
                        userHeader={ userHeader }
                        club_id={ null }
                        setIsClosed={ setModifyPostIsClosed }
                        post_id={ modifyPostId }
                    />
                }
            />
        </>
    );
}