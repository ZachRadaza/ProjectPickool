import { useEffect, useState } from "react";
import { type Posts, type UserHeader } from "../../utils/schemas";
import Button from "../ui/buttons/Button";
import { ExtensionService } from "../../utils/ExtensionService";

type ClubPostsCompProp = {
    userHeader: UserHeader | null;
    club_id: string | null;
}

export default function ClubPostsComp({ userHeader, club_id }: ClubPostsCompProp){
    const [posts, setPosts] = useState<Posts[]>([]);
    const [currentPostPage, setCurrentPostPage] = useState<number>(0);
    const [hasMorePosts, setHasMorePosts] = useState<boolean>(true);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
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

    return (
        <div>
            { userHeader &&
                <Button 
                    content="Create Post"
                    onBtnClick={ () => {} }
                    additionalClasses="create-post-btn"
                />
            }
        </div>
    );
}