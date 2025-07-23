import {Pressable, Text, TextInput, View} from "react-native";
import React, {useState} from "react";
import Constants from 'expo-constants';
import {ExifData} from "@/app/lib/Types";
import * as Location from "expo-location";
import ExifForm from "@/app/components/ExifForm";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function HeaderBar() {
    const [exif, setExif] = useState<ExifData | undefined>(undefined);
    const [timePeriod, setTimePeriod] = useState<string>("This Week")
    const [showOptions, setShowOptions] = useState<boolean>(false)
    const options: string[] = ["Today", "This Week", "This Month", "This Year"]
    const [showExifForm, setShowExifForm] = useState<boolean>(false)

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "denied") return;
        const location = await Location.getCurrentPositionAsync();
        setExif((prevState) => ({ ...prevState, GPSLatitude: location.coords.latitude,
            GPSLongitude: location.coords.longitude }))
    }

    return (
        <>
            <View style={{ position: "relative", zIndex: 100, flexDirection: "column" }}>
                <Text style={{ fontSize: 32, fontFamily: "BethEllen-Regular", color: 'rgba(229,229,229,0.97)',
                    alignSelf: "center" }}>Photography App</Text>
                <View style={{ position: "relative", zIndex: 100, padding: 15, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    <View style={{ position: "relative", zIndex: 100 }}>
                        <TextInput value={timePeriod} onFocus={() => setShowOptions(true)} onBlur={() => setTimeout(() => setShowOptions(false), 50)}
                                   style={{ maxWidth: 120, fontFamily: "SpaceMono-Regular", color: "white", fontSize: 16, padding: 10,
                                       borderRadius: 15, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                        </TextInput>
                        { showOptions &&
                            <View style={{ position: "absolute", paddingTop: 10, maxHeight: 250, width: '100%', top: 40, borderRadius: 6, backgroundColor: 'black', zIndex: 100 }}>
                                { options.map((option) => (
                                    <Pressable key={option} onPress={() => setTimePeriod(option)} style={{ flexDirection: "row", paddingHorizontal: 10, borderRadius: 6, height: 40, width: '100%',
                                        justifyContent: "center"}}>
                                        <Text style={{flex: 1, height: '100%', justifyContent: "center", fontFamily: "SpaceMono-Regular", color: "white"}}>{ option }</Text>
                                    </Pressable>
                                ))}
                            </View> }
                    </View>
                    <Pressable onPress={getCurrentLocation} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 15,
                        borderRadius: 15, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                        <Text style={{ fontFamily: "SpaceMono-Regular", fontSize: 12, color: 'black' }}>Use current location</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowExifForm(true)} style={{ backgroundColor: "#ffffff", padding: 10, paddingHorizontal: 15,
                        borderRadius: 15, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                        <Text style={{ fontFamily: "SpaceMono-Regular", fontSize: 12, color: 'black' }}>Filters</Text>
                    </Pressable>
                </View>
            </View>
            { showExifForm && <ExifForm setExif={setExif} exif={exif} onSubmit={() => setShowExifForm(false)} formMode={"Filtering"} /> }
        </>

    );
}
