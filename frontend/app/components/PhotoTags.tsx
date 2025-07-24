import {Text, View} from "react-native";
import React from "react";
import {ExifData} from "@/app/lib/Types";

const keyToLabelMap: Record<string, string> = {
    "Make": "Make",
    "Model": "Model",
    "LensModel": "Lens",
    "FocalLength": "Focal Length",
    "Flash": "Flash",
    "FNumber": "FNumber",
    "ISOSpeedRatings": "ISO",
    "ShutterSpeedValue": "Shutter Speed",
};

export default function PhotoTags(exif : { exif: ExifData  }) {
    const { exif: exifData } = exif;
    const values = Object.entries(exifData).map(([key, value]) => value)
    const isExifEmpty = values.every((value) => value === undefined)

    return (
        <View style={{ flexDirection: "row", gap: 10, justifyContent: "flex-start", alignItems: "center", flexWrap: "wrap" }}>
            { !isExifEmpty && Object.entries(exifData).map(([key, value]) => {
                if (value !== undefined && keyToLabelMap[key]) {
                    return (
                        <View key={key} style={{
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 4,
                            minWidth: 40
                        }}>
                            <Text style={{ color: "white", fontFamily: "SpaceMono-Regular", fontSize: 10 }}>{keyToLabelMap[key]}</Text>
                            <View style={{
                                backgroundColor: 'rgba(56,52,52,0.86)',
                                borderRadius: 8,
                                padding: 5,
                                width: "100%",
                                alignItems: "center"
                            }}>
                                <Text style={{ color: "white", fontFamily: "SpaceMono-Regular", fontSize: 12 }}>{String(value)}</Text>
                            </View>
                        </View>
                    )
                }
            })}
            { isExifEmpty && <Text style={{
                fontSize: 14,
                padding: 5,
                fontFamily: "SpaceMono-Regular",
                color: 'rgba(229,229,229,0.97)',
                textAlign: "center" }}>This photo has no attributes.</Text> }
        </View>
    )
}