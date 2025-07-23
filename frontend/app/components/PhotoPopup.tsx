import {View} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import {Image} from "expo-image";
import PhotoTags from "@/app/components/PhotoTags";
import {ExifData} from "@/app/lib/Types";

export default function PhotoPopup({ children, onClose, photoSrc, exif } : {
    children: React.ReactNode
    onClose: React.Dispatch<React.SetStateAction<boolean>>
    photoSrc: string
    exif: ExifData | null
}) {

    return (
        <View style={{ flexDirection: "column", backgroundColor: "#181a1b", borderRadius: 15, maxWidth: 340, height: "auto" }}>
            <View style={{ padding: 7.5, borderRadius: 15, flexDirection: "row", gap: 10, zIndex: 100, width: "100%",
                justifyContent: "flex-end", alignItems: "flex-end" }}>
                <AntDesign onPress={() => onClose(false)} name="close" size={22} color="white" />
            </View>
            <Image style={{ width: 340, height: 400, marginBottom: 30 }} source={photoSrc}></Image>
            { exif && <PhotoTags exif={exif} /> }
            { children }
        </View>
    )
}