import {Pressable, Text, TextInput, View} from "react-native";
import React, {useState} from "react";
import {ExifData, TimePeriodValue} from "@/app/lib/Types";
import * as Location from "expo-location";
import ExifForm from "@/app/components/ExifForm";
import PhotoModal from "@/app/components/PhotoModal";
import AnimatedButton from "@/app/components/AnimatedButton";

const labelToValueMap: Record<string, TimePeriodValue> = {
    "Today": "today",
    "This Week": "this_week",
    "This Month": "this_month",
    "This Year": "this_year",
};

const valueToLabelMap: Record<TimePeriodValue, string> = {
    "today": "Today",
    "this_week": "This Week",
    "this_month": "This Month",
    "this_year": "This Year",
};

const options: string[] = ["Today", "This Week", "This Month", "This Year"]

const emptyExifData: ExifData = {
    Make: undefined,
    Model: undefined,
    LensModel: undefined,
    FocalLength: undefined,
    Flash: undefined,
    FNumber: undefined,
    GPSLatitude: undefined,
    GPSLongitude: undefined,
    ISOSpeedRatings: undefined,
    ShutterSpeedValue: undefined,
};

export default function SearchBar({ onSearch } : { onSearch: (exif: ExifData, sort_by_time: TimePeriodValue) => Promise<any> }) {
    const [exif, setExif] = useState<ExifData>(emptyExifData);
    const [timePeriod, setTimePeriod] = useState<TimePeriodValue>("this_week")
    const [showOptions, setShowOptions] = useState<boolean>(false)
    const [showExifForm, setShowExifForm] = useState<boolean>(false)

    const getCurrentLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "denied") return;
        const location = await Location.getCurrentPositionAsync();
        setExif((prevState) => ({ ...prevState, GPSLatitude: location.coords.latitude,
            GPSLongitude: location.coords.longitude }))
    }

    const timePeriodChange = async (option: TimePeriodValue) => {
        setTimePeriod(option)
        await onSearch(exif, option)
    }

    const applyFilter = async () => {
        await onSearch(exif, timePeriod)
        setShowExifForm(false)
    }

    return (
        <>
            <View style={{ position: "relative", zIndex: 100, flexDirection: "column", paddingHorizontal: 15, paddingVertical: 10 }}>
                <View style={{ position: "relative", zIndex: 100, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    <View style={{ position: "relative", zIndex: 100 }}>
                        <TextInput editable={false} value={valueToLabelMap[timePeriod]} onFocus={() => setShowOptions(true)} onBlur={() => setTimeout(() => setShowOptions(false), 50)}
                                   style={{ outlineWidth: 0, maxWidth: 120, fontFamily: "SpaceMono-Regular", color: "white", fontSize: 16, padding: 10,
                                       borderRadius: 15, flexDirection: "row", justifyContent: "center", alignItems: "center"}}>
                        </TextInput>
                        { showOptions &&
                            <View style={{ position: "absolute", paddingTop: 10, maxHeight: 250, width: '100%', top: 40, borderRadius: 6, backgroundColor: 'black', zIndex: 100 }}>
                                { options.map((option) => (
                                    <Pressable key={option} onPress={() => timePeriodChange(labelToValueMap[option])} style={{ flexDirection: "row", paddingHorizontal: 10, borderRadius: 6, height: 40, width: '100%',
                                        justifyContent: "center"}}>
                                        <Text style={{flex: 1, height: '100%', justifyContent: "center", fontFamily: "SpaceMono-Regular", color: "white"}}>{ option }</Text>
                                    </Pressable>
                                ))}
                            </View> }
                    </View>
                    <View style={{ flexDirection: "row", gap: 10 }}>
                        <AnimatedButton styles={{ marginVertical: "auto" }} onClick={getCurrentLocation} defaultBgColor={'rgba(56,52,52,0.86)'}>
                            <Text style={{ fontFamily: "SpaceMono-Regular", fontSize: 12, color: 'white' }}>Use current location</Text>
                        </AnimatedButton>
                        <AnimatedButton styles={{ marginVertical: "auto" }} onClick={() => setShowExifForm(true)} defaultBgColor={'rgba(56,52,52,0.86)'}>
                            <Text style={{ fontFamily: "SpaceMono-Regular", fontSize: 12, color: 'white' }}>Filters</Text>
                        </AnimatedButton>
                    </View>
                </View>
            </View>
            { showExifForm &&
                <PhotoModal showModal={showExifForm}>
                    <ExifForm setExif={setExif} exif={exif} onSubmit={applyFilter} formMode={"Filtering"} onClose={() => setShowExifForm(false)} />
                </PhotoModal>
            }
        </>
    );
}
