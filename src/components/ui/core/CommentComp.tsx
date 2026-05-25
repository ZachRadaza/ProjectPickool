import { timeAgo } from "../../../utils/random";
import type { Comments, UserHeader } from "../../../utils/schemas";
import "./CommentComp.css";

type CommentCompProp = {
    comment: Comments;
    isParent: boolean;
    onReplyClick: (comment_id: string, comment_user: UserHeader) => void;
    onShowReplyClick: (comment: Comments) => void;
    canComment: boolean;
};

export default function CommentComp({ comment, canComment, isParent, onReplyClick, onShowReplyClick }: CommentCompProp){
    return (
        <div className={`comment-comp-cont ${comment.parent_comment_id && "reply"} ${isParent && "parent"}`}>
            <img className="profile-pic" src={ comment.user?.profile_pic ?? import.meta.env.VITE_DEFAULT_PROFILE_PIC }/>
            <div className="right-side">
                <div className="header">
                    <h6 className="username">{ comment.user?.username }</h6>
                    <p className="date">{ timeAgo(comment.created_at!) }</p>
                </div>
                <p className="comment">{ comment.comment }</p>
                <div className="footer">
                    { comment.hasReplies
                        ? <button className="ui reply" onClick={ () => onShowReplyClick(comment) }>Show Replies</button>
                        : <p>.</p>
                    }
                    { (comment.parent_comment_id === null && canComment) &&
                        <button 
                            className="ui reply" 
                            onClick={ () => { onReplyClick(comment.id!, comment.user!); onShowReplyClick(comment) }}
                        >
                            Reply
                        </button>
                    }
                </div>
            </div>
        </div>
    );
}