import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import {useEffect, useRef, useState} from "react";
import Constants from "expo-constants";
const mapsKey = Constants.expoConfig?.extra?.MAPS_KEY;

export default function LocationPicker({ onSelect }: { onSelect: (location: { lat: number, lng: number }) => void }) {
    const [marker, setMarker] = useState<{ lat: number, lng: number } | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            const position = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
            };
            setMarker(position);
            onSelect(position);
        }
    };

    useEffect(() => {
        if (mapRef.current) {
            window.google.maps.event.trigger(mapRef.current, 'resize');
        }
    }, []);

    return (
        <LoadScript googleMapsApiKey="AIzaSyAZv5DPvUzu1qgFzbwxJUNm_dSk28dZeNc">
            <GoogleMap
                onLoad={(map) => {
                    mapRef.current = map;
                    window.google.maps.event.trigger(map, 'resize');
                }}
                mapContainerStyle={containerStyle}
                zoom={10}
                onClick={handleMapClick}
            >
                {marker && <Marker position={marker} />}
            </GoogleMap>
        </LoadScript>
    )
}

const containerStyle = {
    width: '100%',
    height: '400px',
};