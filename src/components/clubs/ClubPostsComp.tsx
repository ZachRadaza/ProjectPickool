import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { type Club_Members, type Posts, type UserHeader } from "../../utils/schemas";
import Button from "../ui/buttons/Button";
import { ExtensionService } from "../../utils/ExtensionService";
import PostsComp from "../ui/core/PostsComp";
import Loading from "../../pages/Loading";
import ErrorPage from "../../pages/Error";
import "./ClubPostsComp.css";

type ClubPostsCompProp = {
    userHeader: UserHeader | null;
    club_id: string | null;
    userClubMember: Club_Members | null;
    setClosedNoUserPopup: Dispatch<SetStateAction<boolean>>;
    setClosedModifyPost: Dispatch<SetStateAction<boolean>>;
}

export default function ClubPostsComp({ userHeader, club_id, userClubMember, setClosedNoUserPopup, setClosedModifyPost }: ClubPostsCompProp){
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
            if(!club_id){
                setIsLoading(false);
                setError("No Club ID Located");
                return;
            }

            const page = currentPostPage;

            const postsData = await ExtensionService.PostService.getClubPosts(club_id, userHeader?.id || null, page);

            setPosts([...posts, ...postsData.data]);
            setHasMorePosts(postsData.hasMore);
            setCurrentPostPage(page + 1);
        } catch(error){

        }
    }

    useEffect(() => {
        getData();
        
        async function getData(){
            setIsLoading(true);

            getPosts();

            setIsLoading(false);
        }
    }, []);

    let content;

    if(isLoading)
        content = <Loading />;
    else if(error)
        content = <ErrorPage error={ error } />;
    else
        content = <>
            { (userHeader && userClubMember) &&
                <Button 
                    content="Create Post"
                    onBtnClick={ () => setClosedModifyPost(false) }
                    additionalClasses="create-post-btn"
                />
            }
            { posts.length > 0
                ? <div className="posts-cont">
                    { posts.map((post) => 
                        <PostsComp 
                            post={ post } 
                            userHeader={ userHeader } 
                            userClubMember={ userClubMember }
                            setPost={ (updated) => setIndividualPost(updated.id!, updated) }
                            setModifyPostIsClosed={ setClosedModifyPost }
                            setClosedNoUserPopup={ setClosedNoUserPopup }
                            setPosts={ setPosts }
                            showPin={ true }
                            key={ post.id }
                        />
                    )}
                </div>
                : <h6>Club has no posts</h6>
            }
            { hasMorePosts && <Button content="Load More" onBtnClick={ () => getPosts() }/> }
        </>
    return (
        <div className="club-posts-cont">
            { content }
        </div>
    );
}