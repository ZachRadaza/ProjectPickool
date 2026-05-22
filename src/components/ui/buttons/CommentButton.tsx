import "./CommentButton.css";

type CommentButtonProp = {
    comment_count: number;
    onBtnClick: () => void;
    additionalClasses?: string;
};

export default function CommentButton({ comment_count, onBtnClick, additionalClasses }: CommentButtonProp){
    return (
        <button className={`ui comment-btn ${additionalClasses}`} onClick={ () => onBtnClick() }>
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M23,13 L9,13 C8.448,13 8,12.553 8,12 C8,11.448 8.448,11 9,11 L23,11 C23.552,11 24,11.448 24,12 C24,12.553 23.552,13 23,13 Z M21,19 L11,19 C10.448,19 10,18.553 10,18 C10,17.447 10.448,17 11,17 L21,17 C21.552,17 22,17.447 22,18 C22,18.553 21.552,19 21,19 Z M16,0 C7.164,0 0,6.269 0,14 C0,18.419 2.345,22.354 6,24.919 L6,32 L13.009,27.747 C13.979,27.907 14.977,28 16,28 C24.836,28 32,21.732 32,14 C32,6.269 24.836,0 16,0 Z"
                    fill="currentColor"
                />
            </svg>
            <h6>{ comment_count }</h6>
        </button>
    );
}