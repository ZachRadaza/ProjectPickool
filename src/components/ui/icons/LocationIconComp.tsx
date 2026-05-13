import type { Locations } from "../../../utils/schemas";
import "./IconComp.css";

type LocationIconCompProp = {
    location: Locations | null;
};

export default function LocationIconComp({ location }: LocationIconCompProp){
    const locUrl = `https://www.google.com/maps?q=${location?.latitude},${location?.longitude}`;

    if(!location)
        return <></>;
    else
        return (
            <div className={`icon-comp-cont`}>
                <svg className="icon" viewBox="-4 -4 32 40" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 9c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 8c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm0-17C5.373 0 0 5.373 0 12c0 5.018 10.005 20.011 12 20 1.964.011 12-15.05 12-20C24 5.373 18.627 0 12 0z"
                        fill="currentColor"
                    />
                </svg>
                <div className="right-side">
                    <h6 className="name">{ location.name }</h6>
                    <p className="bottom"><a href={ locUrl } target="_blank" rel="noopener noreferrer">{ location.address }</a></p>
                </div>
            </div>
        );
}