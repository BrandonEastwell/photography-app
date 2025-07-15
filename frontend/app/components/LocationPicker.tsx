import {Platform} from "react-native";

export default function LocationPicker() {
    if (Platform.OS === 'web') {
        return
    }

    const MapView = require('react-native-maps').default;
    const { Marker } = require('react-native-maps');

    return (
        <MapView style={{ width: '100%', height: '100%' }} />
    )
}