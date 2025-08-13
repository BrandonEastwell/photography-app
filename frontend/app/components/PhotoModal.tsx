import React from "react";
import {Modal, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

export default function PhotoModal({ children } : { children: React.ReactNode }) {

    return (
        <Modal transparent>
            <SafeAreaView style={{ backgroundColor: 'rgba(0,0,0,0.70)', height: "100%", gap: 15, justifyContent: "center", alignItems: "center"}}>
                { children }
            </SafeAreaView>
        </Modal>
    )
}