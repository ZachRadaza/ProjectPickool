import "./EditButton.css";

type EditButtonProp = {
    action: () => void;
};

export default function EditButton({ action }: EditButtonProp){
    return (
        <button
            onClick={ () => action() }
            className="ui edit"
        >
            Edit
        </button>
    );
}