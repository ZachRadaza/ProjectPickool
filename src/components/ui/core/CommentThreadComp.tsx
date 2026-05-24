import type { Club_Members, Comments, UserHeader } from "../../../utils/schemas";
import CommentComp from "./CommentComp";
import "./CommentThreadComp.css";

type CommentThreadComp = {
    parentComment: Comments;
    replies: Comments[];
    onReplyClick: (comment_id: string, comment_user: UserHeader) => void;
    onShowReplyClick: (comment: Comments) => void;
    userClubMember?: Club_Members | null;
}

export default function CommentThreadComp({ parentComment, replies, userClubMember, onReplyClick, onShowReplyClick }: CommentThreadComp){
    return (
        <div className="comment-thread-comp-cont">
            <CommentComp
                comment={ parentComment }
                userClubMember={ userClubMember }
                isParent={ true }
                onReplyClick={ onReplyClick }
                onShowReplyClick={ onShowReplyClick }
            />
            { replies.map((comment) => 
                <CommentComp 
                    comment={ comment }
                    userClubMember={ userClubMember }
                    isParent={ false }
                    onReplyClick={ onReplyClick }
                    onShowReplyClick={ onShowReplyClick }
                    key={ comment.id }
                />    
            )}
        </div>
    );
}