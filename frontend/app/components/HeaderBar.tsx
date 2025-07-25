import {Modal, Text, View} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, {useState} from "react";

export default function HeaderBar() {
    const [showSideBar, setShowSideBar] = useState<boolean>(false)

    return (
        <>
            <View style={{ position: "relative", height: 40, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                <MaterialIcons onPress={() => setShowSideBar(!showSideBar)} style={{ alignSelf: "center",  padding: 15 }} name="menu" size={24} color="white" />
                <View style={{ position: "absolute", width: "100%", justifyContent: "center"}}>
                    <Text style={{ fontSize: 20, fontFamily: "BethEllen-Regular", color: 'white',
                        alignSelf: "center", marginHorizontal: "auto" }}>Photography App</Text>
                </View>
            </View>
            <View style={{ position: "absolute", backgroundColor: "black", height: 200, width: 200, minWidth: 200 }}>

            </View>
        </>
    )
}