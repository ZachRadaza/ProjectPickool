import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { Posts, UserHeader, Users } from "../../utils/schemas";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import PostsComp from "../ui/core/PostsComp";
import { ExtensionService } from "../../utils/ExtensionService";
import Button from "../ui/buttons/Button";
import "./UserTabComp.css";

type UserTabPostsCompProp = {
    userHeader: UserHeader | null;
    user: Users | null;
    setClosedModifyPosts: Dispatch<SetStateAction<boolean>>;
};

export default function UserTabPostsComp({ userHeader, user, setClosedModifyPosts }: UserTabPostsCompProp){
    const [posts, setPosts] = useState<Posts[]>([]);
    const [currentPostPage, setCurrentPostPage] = useState<number>(1);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);

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
            const { data: postData, hasMore } = await ExtensionService.PostService.getUserPosts(user?.id, userHeader?.id || null, page);

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
        <div className="user-tab-posts-cont">
            { posts.length > 0
                ? <>
                    { posts.map((post) => 
                        <PostsComp 
                            post={ post }
                            userHeader={ userHeader }
                            userClubMember={ null }
                            setPosts={ setPosts }
                            setModifyPostIsClosed={ setClosedModifyPosts }
                            setPost={ (updated) => setIndividualPost(updated.id!, updated) }
                        />
                    )}
                    { hasMorePosts && <Button content="Load More" onBtnClick={ () => getPosts() }/> }
                </>
                : <h6>{ user?.username ?? "Guest" } has no posts</h6> 
            }
        </div>
    );
}