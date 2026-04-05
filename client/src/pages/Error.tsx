import "./Error.css";

type ErrorProp = {
    error: string | null;
}

export default function ErrorPage({ error }: ErrorProp){
    return (
        <div className="error-cont">
            <h4>An Error Has Occurred</h4>
            <h6>{ error }</h6>
        </div>
    );
}