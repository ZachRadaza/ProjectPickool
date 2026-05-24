import "./LikeButton.css";

type LikeButtonProp = {
    onBtnClick: () => void;
    like_count: number;
    additionalClasses?: string;
    isLiked: boolean;
    isDisabled?: boolean;
}

export default function LikeButton({ onBtnClick, like_count, additionalClasses, isLiked, isDisabled }: LikeButtonProp){
    return (
        <button className={`ui like-btn ${additionalClasses} ${isLiked && "liked"}`} onClick={ () => onBtnClick() } disabled={ isDisabled }>
            { isLiked
                ? <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3,21a1,1,0,0,1-1-1V12a1,1,0,0,1,1-1H6V21ZM19.949,10H14.178V5c0-2-3.076-2-3.076-2s0,4-1.026,5C9.52,8.543,8.669,10.348,8,11V21H18.644a2.036,2.036,0,0,0,2.017-1.642l1.3-7A2.015,2.015,0,0,0,19.949,10Z"/></svg>
                : <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2,22H18.644a3.036,3.036,0,0,0,3-2.459l1.305-7a2.962,2.962,0,0,0-.637-2.439A3.064,3.064,0,0,0,19.949,9H15.178V5c0-2.061-2.113-3-4.076-3a1,1,0,0,0-1,1c0,1.907-.34,3.91-.724,4.284L6.593,10H2a1,1,0,0,0-1,1V21A1,1,0,0,0,2,22ZM8,11.421l2.774-2.7c.93-.907,1.212-3.112,1.3-4.584.542.129,1.109.38,1.109.868v5a1,1,0,0,0,1,1h5.771a1.067,1.067,0,0,1,.824.38.958.958,0,0,1,.21.8l-1.3,7A1.036,1.036,0,0,1,18.644,20H8ZM3,12H6v8H3Z"/></svg>
            }
            <h6>{ like_count }</h6>
        </button>
    );
}