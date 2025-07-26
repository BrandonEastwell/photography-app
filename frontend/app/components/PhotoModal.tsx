import React, {useEffect, useRef} from "react";
import {Animated, Modal, View} from "react-native";

export default function PhotoModal({ children } : { children: React.ReactNode }) {

    return (
        <Modal transparent>
            <View style={{ height: "100%", flexDirection: "column", gap: 15, justifyContent: "center", alignItems: "center"}}>
                { children }
            </View>
        </Modal>
    )
}