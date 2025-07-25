import React from "react";
import {Modal, View} from "react-native";

export default function PhotoModal({ children } : { children: React.ReactNode}) {

    return (
        <Modal transparent>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.70)', height: "100%", flexDirection: "column", gap: 15, justifyContent: "center", alignItems: "center"}}>
                { children }
            </View>
        </Modal>
    )
}