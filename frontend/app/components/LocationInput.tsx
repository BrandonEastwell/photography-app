import {Pressable, Text, View} from "react-native";
import React, {useState} from "react";
import * as Location from "expo-location";
import {ExifData} from "@/app/lib/Types";
import LocationPicker from "@/components/LocationPicker";

export default function LocationInput({ setExif, exif } : {
    setExif: React.Dispatch<React.SetStateAction<ExifData>>
    exif: ExifData;
}) {
    const [showMap, setShowMap] = useState<boolean>(false);

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "denied") return;
        const location = await Location.getCurrentPositionAsync();
        setExif((prevState) => ({ ...prevState, GPSLatitude: location.coords.latitude,
            GPSLongitude: location.coords.longitude }))
    }

    return (
        <View style={{ flexDirection: "row", gap: 15, marginBottom: 40, width: "100%" }}>
            <View style={{ flexDirection: "column", gap: 15 }}>
                <Pressable onPress={getCurrentLocation} style={{ backgroundColor: "#ffffff",
                    padding: 10, paddingHorizontal: 20, borderRadius: 15, flexDirection: "row", gap: 10,
                    justifyContent: "center", alignItems: "center"}}>
                    <Text style={{ color: 'black' }}>Use current location</Text>
                </Pressable>
                {/*<Pressable onPress={() => setShowMap(true)} style={{ backgroundColor: "#ffffff",*/}
                {/*    padding: 10, paddingHorizontal: 20, borderRadius: 15, flexDirection: "row", gap: 10,*/}
                {/*    justifyContent: "center", alignItems: "center"}}>*/}
                {/*    <Text style={{ color: 'black' }}>Select location</Text>*/}
                {/*</Pressable>*/}
            </View>
            <View style={{ backgroundColor: "rgba(12,12,12, 1)", padding: 10, paddingHorizontal: 20, borderRadius: 15,
                justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 14, fontFamily: "SpaceMono-Regular", color: 'rgba(229,229,229,0.97)'}}>
                    {exif.GPSLatitude === undefined && exif.GPSLongitude === undefined ? "No location set" : `${exif.GPSLatitude}, ${exif.GPSLongitude}`}
                </Text>
            </View>
            { showMap && <LocationPicker /> }
        </View>
    )
}