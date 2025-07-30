import React, {useRef} from "react";
import {Animated, Modal, View} from "react-native";

export default function PhotoModal({ children } : { children: React.ReactNode }) {
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // useEffect(() => {
    //     if (showModal) {
    //         Animated.timing(opacityAnim, {
    //             toValue: 0.7,
    //             duration: 200,
    //             useNativeDriver: false,
    //         }).start();
    //     } else {
    //         Animated.timing(opacityAnim, {
    //             toValue: 0,
    //             duration: 200,
    //             useNativeDriver: false,
    //         }).start();
    //     }
    // }, []);

    const opacity = opacityAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    return (
        <Modal transparent>
            <View style={{ backgroundColor: 'rgba(0,0,0,0.70)', opacity, height: "100%", flexDirection: "column", gap: 15, justifyContent: "center", alignItems: "center"}}>
                { children }
            </View>
        </Modal>
    )
}