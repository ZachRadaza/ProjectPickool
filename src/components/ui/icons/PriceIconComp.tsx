import "./IconComp.css";

type PriceIconCompProp = {
    price: number | null;
    hoursToPay?: number;
};

export default function PriceIconComp({ price, hoursToPay }: PriceIconCompProp){
    return (
        <div className="icon-comp-cont">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.692 11.308 3H3v8.308L12.692 21ZM9.923 9.923a1.958 1.958 0 1 1 0-2.769 1.957 1.957 0 0 1 0 2.769Z"/>
            </svg>
            <div className="right-side">
                <h6 className="name">{ price === 0 ? "Free" : `₱${price}` }</h6>
                { price! > 0 && <p className="bottom">{ hoursToPay } Hours to Pay</p> }
            </div>
        </div>
    );
}