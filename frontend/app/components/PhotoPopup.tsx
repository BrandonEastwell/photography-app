import {View} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";

export default function PhotoPopup({ children, setShowUpload } : { children: React.ReactNode, setShowUpload: React.Dispatch<React.SetStateAction<boolean>> }) {

    return (
        <View style={{ flexDirection: "column", backgroundColor: "#181a1b", borderRadius: 15, maxWidth: 340, height: "auto" }}>
            <View style={{ padding: 7.5, borderRadius: 15, flexDirection: "row", gap: 10, zIndex: 100, width: "100%",
                justifyContent: "flex-end", alignItems: "flex-end" }}>
                <AntDesign onPress={() => setShowUpload(false)} name="close" size={24} color="white" />
            </View>
            { children }
        </View>
    )
}