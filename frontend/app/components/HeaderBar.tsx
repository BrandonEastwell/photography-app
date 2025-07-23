import {Text, View} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";

export default function HeaderBar() {

    return (
        <View style={{ position: "relative", height: 40, flexDirection: "row", alignItems: "center", padding: 5 }}>
            <MaterialIcons style={{alignSelf: "center"}} name="menu" size={24} color="white" />
            <View style={{ position: "absolute", width: "100%", justifyContent: "center"}}>
                <Text style={{ fontSize: 20, fontFamily: "BethEllen-Regular", color: 'white',
                    alignSelf: "center", marginHorizontal: "auto" }}>Photography App</Text>
            </View>
        </View>
    )
}