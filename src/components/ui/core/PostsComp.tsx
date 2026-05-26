import { useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { LikeType, Role, type Club_Members, type Comments, type Posts, type UserHeader } from "../../../utils/schemas";
import CommentButton from "../buttons/CommentButton";
import LikeButton from "../buttons/LikeButton";
import "./PostsComp.css";
import Button from "../buttons/Button";
import { ExtensionService } from "../../../utils/ExtensionService";
import EditButton from "../buttons/EditButton";
import DeleteButton from "../buttons/DeleteButton";
import SendButton from "../buttons/SendButton";
import Loading from "../../../pages/Loading";
import CloseButton from "../buttons/CloseButton";
import CommentThreadComp from "./CommentThreadComp";
import { useNavigate } from "react-router-dom";
import { timeAgo, wait } from "../../../utils/random";
import PostArrowsButton from "../buttons/PostArrowsButton";

type PostCompProp = {
    post: Posts;
    userHeader: UserHeader | null;
    userClubMember: Club_Members | null;
    setPost: (post: Posts) => void;
    setPosts?: Dispatch<SetStateAction<Posts[]>>;
    setModifyPostIsClosed: Dispatch<SetStateAction<boolean>>;
    setClosedNoUserPopup?: Dispatch<SetStateAction<boolean>>;
};

export default function PostsComp({ 
    post, 
    userHeader, 
    userClubMember, 
    setPost, 
    setPosts,
    setModifyPostIsClosed, 
    setClosedNoUserPopup 
}: PostCompProp){
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [showComments, setShowComments] = useState<boolean>(false);
    const [comment, setComment] = useState<Comments>({
        post_id: post.id ?? "",
        comment: "",
        user_id: userHeader?.id,
        parent_comment_id: null
    });
    const [commentsLoading, setCommentLoading] = useState<boolean>(false);

    const commentIsValid = useMemo(() =>
        comment.post_id && comment.comment && comment.user_id
    , [comment]);

    const imagesRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    function setPostId(){
        const params = new URLSearchParams(location.search);
        params.set("post", post?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    function openUserProfile(){
        const params = new URLSearchParams(location.search);
        params.set("previewuser", post.user?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    function openClub(){
        const params = new URLSearchParams(location.search);
        params.set("club", post.club?.id ?? "");
        navigate(`${location.pathname}?${params.toString()}`);
    }

    function handleScrollImages(e: React.UIEvent<HTMLDivElement>) {
        const container = e.currentTarget;
        const index = Math.round(
            container.scrollLeft / container.clientWidth
        );
        setCurrentImageIndex(index);
    }

    function moveImage(scrollLeft: boolean){
        if(!imagesRef.current) 
            return;

        const tagrgetIndex = scrollLeft 
            ? Math.max(currentImageIndex - 1, 0) 
            : Math.min(currentImageIndex + 1, post.images?.length! - 1);

        imagesRef.current.scrollTo({
            left: imagesRef.current.clientWidth * tagrgetIndex,
            behavior: "smooth"
        });
    }

    async function editBtnClicked(){
        if(!setModifyPostIsClosed || !post.id)
            return;

        setPostId();
        await wait(50);
        setModifyPostIsClosed(false);
    }

    async function likePost(){
        try{
            if(!userHeader){
                setClosedNoUserPopup && setClosedNoUserPopup(false);
                return;
            }

            if(!post || !post.can_like)
                return;

            const liked = post.liked_by_user ?? false;
            const likeCount = post.like_count 
                ? (liked ? post.like_count - 1 : post.like_count + 1)
                : (liked ? 0 : 1);
            const updatedPost: Posts = { ...post, liked_by_user: !liked, like_count: likeCount };
            
            setPost(updatedPost);

            liked
                ? await ExtensionService.LikeService.deletePostLike(post.id!, userHeader?.id)
                : await ExtensionService.LikeService.addPostLike(post.id!, userHeader?.id, LikeType.LIKE);
        } catch(error: any){
            throw new Error(error);
        }
    }

    async function loadComments(){
        try{
            if(!post.id || !post.hasMoreComments || post.commentPage === undefined)
                return;

            const firstLoad = !post.comments;
            setCommentLoading(firstLoad);
            setShowComments(true);

            const { data: commentsLoaded, hasMore } = await ExtensionService.CommentService.getPostParentComments(post.id, post.commentPage);
            
            const allComments = post.comments ? [...post.comments.flat(), ...commentsLoaded] : commentsLoaded;
            const sortedComments = allComments.map((com) => [com]);

            const updatedPost: Posts = { 
                ...post, 
                comments: sortedComments,
                hasMoreComments: hasMore
            };

            setPost(updatedPost);
            setCommentLoading(false);
        } catch(error: any){
            throw new Error(error);
        }
    }

    async function loadCommentThread(comment_parent: Comments){
        try{
            if(!comment_parent.id || !comment_parent.hasReplies || !comment_parent.replyPage)
                return;

            const { data: replies, hasMore } = await ExtensionService.CommentService.getCommentThread(comment_parent.id, comment_parent.replyPage);

            const updatedThreads = post.comments!.map((thread) => {
                const parentComment = thread[0];
                if(parentComment.id !== comment_parent.id)
                    return thread;

                const updatedParentComment = {
                    ...parentComment,
                    hasReplies: hasMore,
                    replyPage: (parentComment.replyPage ?? 1) + 1
                };
                const existingReplies = thread.slice(1);

                return [
                    updatedParentComment,
                    ...existingReplies,
                    ...replies
                ];
            });

            const updatedPost: Posts = {
                ...post,
                comments: updatedThreads,
                hasMoreComments: hasMore
            };

            setPost(updatedPost);
        } catch(error: any){
            throw new Error(error);
        }
    }

    async function addComment(){
        try{
            if(!post.id || !userHeader?.id || !post.can_like)
                return;

            if(!commentIsValid)
                return;

            const commentNew = await ExtensionService.CommentService.addComment(comment);
            if(!commentNew)
                throw new Error("Error in adding comment");

            let updatedPost: Posts;
            if(!comment.parent_comment_id)
                updatedPost = { 
                    ...post, 
                    comments: post.comments ? [...post.comments!, [commentNew]] : [[commentNew]],
                    comment_count: post.comment_count ? post.comment_count + 1 : 1
                };
            else{
                const updatedComments = post.comments
                    ? post.comments.map((thread) => {
                        const parentComment = thread[0];

                        if(parentComment.id === commentNew.parent_comment_id)
                            return [...thread, commentNew];

                        return thread;
                    })
                    : [[commentNew]];

                updatedPost = { 
                    ...post, 
                    comments: updatedComments,
                    comment_count: post.comment_count ? post.comment_count + 1 : 1
                };
            }

            setPost(updatedPost);
            setComment((com) => ({ ...com, comment: "", parent_comment_id: null, parent_comment_user: null }));
        } catch(error: any){
            throw new Error(error);
        }
    }

    async function deletePost(){
        try{
            if(!post.id)
                return;

            const deleted = await ExtensionService.PostService.deletePost(post.id);

            if(!deleted)
                throw new Error("Error in deleting post");

            setPosts && setPosts((p) => p.filter((singlePost) => singlePost.id !== post.id));
        } catch(error: any){
            throw new Error(error);
        }
    }

    return (
        <div className="posts-comp">
            <div className="main-content">
                <div className="header">
                    <div className="user-info">
                        <img className="profile-pic" src={ post.user?.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }/>
                        <div>
                            <h6 className="username" onClick={ () => openUserProfile() }>
                                { post.user?.username }
                            </h6>
                            <h6 className="club-name" onClick={ () => openClub() }>
                                { post.club?.name }
                            </h6>
                        </div>
                    </div>
                    <div>
                        { userHeader?.id === post.user?.id &&
                            <EditButton onBtnClick={ () => editBtnClicked() }/>
                        }
                        { ((userHeader?.id === post.user?.id) ||
                            (userClubMember?.role === Role.ADMIN || userClubMember?.role === Role.OWNER)) &&
                            <DeleteButton onBtnClick={ () => deletePost() } />
                        }
                    </div>
                </div>
                <h4 className="title">{ post.title }</h4>
                <p className="desc">{ post.description }</p>
                { (post.images && post.images.length > 0) &&
                    <div className="images-cont">
                        { currentImageIndex > 0 &&
                            <PostArrowsButton 
                                additionalClasses="btn-left"
                                onBtnClick={ () => moveImage(true) }
                            />
                        }
                        { currentImageIndex < post.images.length - 1 &&
                            <PostArrowsButton 
                                additionalClasses="btn-right"
                                onBtnClick={ () => moveImage(false) }
                                isRight={ true }
                            />
                        }
                        <div className="images" onScroll={ handleScrollImages } ref={ imagesRef }>
                            { post.images.map((img) => <img src={ img.image } key={ img.image } draggable={ false }/>)}
                        </div>
                        <div className="dots-cont">
                            { post.images.length > 1 && 
                                post.images.map((img, index) => 
                                    <p key={ img.image } className={ index === currentImageIndex ? "active" : "" }>•</p>
                                )
                            }
                        </div>
                    </div>
                }
            </div>
            <div className="bottom-bar">
                <div className="action-section">
                    <LikeButton 
                        onBtnClick={ likePost }
                        like_count={ post.like_count || 0 }
                        isLiked={ post.liked_by_user || false }
                    />
                    <CommentButton 
                        comment_count={ post.comment_count || 0}
                        onBtnClick={ loadComments }
                    />
                </div>
                <p className="date">{ timeAgo(post.created_at ? post.created_at : "") }</p>
            </div>
            { showComments &&
                <div className="comments-cont">
                    { post.can_like && <>
                        { comment.parent_comment_user && 
                            <div className="reply-cont">
                                <p className="reply-message">Replying to <span>{ comment.parent_comment_user.username }</span></p> 
                                <CloseButton
                                    additionalClasses="cancel-reply"
                                    setIsClosed={ () => setComment((com) => ({ ...com, parent_comment_id: null, parent_comment_user: null })) }
                                />
                            </div>
                        }
                        <div className="comment-input-cont">
                            <textarea
                                placeholder="Write about post..."
                                value={ comment.comment }
                                onChange={ (event) => { 
                                    event.currentTarget.style.height = "auto";
                                    event.currentTarget.style.height = `${event.currentTarget.scrollHeight}px`;
                                    setComment((com) => ({ ...com, comment: event.target.value}));
                                }}
                                onKeyDown={ (event) => { 
                                    if(event.key === "Enter" && !event.shiftKey){
                                        event.preventDefault();
                                        addComment();
                                    }
                                }}
                                rows={ 1 }
                            ></textarea>
                            <SendButton 
                                isDisabled={ !post.can_like || !userHeader }
                                onBtnCLick={ addComment }
                            />
                        </div></>
                    }
                    { commentsLoading
                        ? <Loading/>
                        : <>
                            { post.comments && post.comments.length > 0
                                ? <div className="comments">
                                    { post.comments.map((comment) => 
                                        <CommentThreadComp 
                                            parentComment={ comment[0] }
                                            replies={ comment.slice(1) }
                                            canComment={ !!post.can_like }
                                            onReplyClick={ (com_id, com_user) => setComment((com) => 
                                                ({ ...com, parent_comment_id: com_id, parent_comment_user: com_user })
                                            )}
                                            onShowReplyClick={ (com) => loadCommentThread(com) }
                                            key={ comment[0].id }
                                        />
                                    )}
                                    { !!post.hasMoreComments && <Button content="Load More" onBtnClick={ () => loadComments() }/> }
                                </div>
                                : <h6>No Comments</h6>
                            }
                        </>
                    }
                </div>
            }
        </div>
    );
}