import "./SearchInput.css";

type SearchInputProp = {
    value: string;
    setValue: (value: string) => void;
    search: (query: string) => void;
};

export default function SearchInput({ value, setValue, search }: SearchInputProp){
    return (
        <div className="search-input-cont">
            <input 
                value={ value }
                onChange={ (e) => setValue(e.target.value) }
                className="search-input"
                onKeyDown={ (e) => {
                    if(e.key === "Enter")
                        search(value);
                }}
                placeholder="Search Clubs and Events"
            />
            <svg 
                onClick={ () => search(value) }
                className="search-icon"
                viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    );
}