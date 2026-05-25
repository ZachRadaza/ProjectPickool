import type { Comments, UserHeader } from "../../../utils/schemas";
import CommentComp from "./CommentComp";
import "./CommentThreadComp.css";

type CommentThreadComp = {
    parentComment: Comments;
    replies: Comments[];
    onReplyClick: (comment_id: string, comment_user: UserHeader) => void;
    onShowReplyClick: (comment: Comments) => void;
    canComment: boolean;
}

export default function CommentThreadComp({ parentComment, replies, canComment, onReplyClick, onShowReplyClick }: CommentThreadComp){
    return (
        <div className="comment-thread-comp-cont">
            <CommentComp
                comment={ parentComment }
                canComment={ canComment }
                isParent={ true }
                onReplyClick={ onReplyClick }
                onShowReplyClick={ onShowReplyClick }
            />
            { replies.map((comment) => 
                <CommentComp 
                    comment={ comment }
                    canComment={ canComment }
                    isParent={ false }
                    onReplyClick={ onReplyClick }
                    onShowReplyClick={ onShowReplyClick }
                    key={ comment.id }
                />    
            )}
        </div>
    );
}