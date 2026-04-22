import { SearchBox } from '@mapbox/search-js-react';
import type { Locations } from '../../utils/schemas';
import "./LocationInput.css";

type LocationInputProps = {
    onSelect: (location: Locations) => void;
    locationName: string;
    additionalClasses?: string;
};

export default function LocationInput({ onSelect, locationName, additionalClasses }: LocationInputProps) {
    return (
        <div className={`location-input-cont ${additionalClasses}`}>
            <SearchBox
                accessToken={ import.meta.env.VITE_MAPBOX_TOKEN }
                placeholder="Search location"
                onRetrieve={ (res) => {
                    const feature = res.features?.[0];
                    if(!feature) 
                        return;

                    const [longitude, latitude] = feature.geometry.coordinates;

                    onSelect({
                        latitude,
                        longitude,
                        address: feature.properties.full_address,
                        name: feature.properties.name
                    });
                }}
                value={ locationName || "" }
            />
        </div>
    );
}