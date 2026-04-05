import "./DeleteButton.css";

type DeleteButtonProp = {
    action: () => void;
};

export default function DeleteButton({ action }: DeleteButtonProp){
    return (
        <button
            onClick={ () => action() }
            className="ui delete"
        >
            Delete
        </button>
    );
}