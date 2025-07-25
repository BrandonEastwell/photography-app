import {Animated, Easing, Pressable, View} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, {useRef, useState} from "react";

export default function HeaderBar({ containerWidth } : { containerWidth: number }) {
    const [showSidebar, setShowSidebar] = useState<boolean>(false)
    const sidebarWidth = useRef(new Animated.Value(0)).current;
    const titleSlide = useRef(new Animated.Value(0)).current;

    const closeSidebar = () => {
        Animated.parallel([
            Animated.timing(sidebarWidth, {
                toValue: 0,
                duration: 200,
                easing: Easing.in(Easing.ease),
                useNativeDriver: false,
            }),
            Animated.timing(titleSlide, {
                toValue: 0,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ]).start(() => setShowSidebar(false));

    };

    const openSidebar = () => {
        setShowSidebar(true)
        Animated.parallel([
            Animated.timing(sidebarWidth, {
                toValue: containerWidth * 0.4,
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
            }),
            Animated.timing(titleSlide, {
                toValue: -((containerWidth * 0.4) * 0.4),
                duration: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            })
        ]).start();
    };

    return (
        <>
            <View style={{ height: 40, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", zIndex: 10 }}>
                <View style={{ position: "absolute", width: "100%", justifyContent: "center" }}>
                    <Animated.Text style={{ fontSize: 20, fontFamily: "BethEllen-Regular", color: 'white',
                        alignSelf: "center", marginHorizontal: "auto", transform: [{ translateX: titleSlide }] }}>Photography App</Animated.Text>
                </View>
                <Pressable onPress={() => showSidebar ? closeSidebar() : openSidebar()} style={{ alignSelf: "center",  padding: 15 }}>
                    <MaterialIcons name="menu" size={24} color="white" />
                </Pressable>
            </View>
            { showSidebar && <View style={{ position: "absolute", flexDirection: "row", width: "100%",
                height: "100%", zIndex: 9 }}>
                <Pressable onPress={() => closeSidebar()} style={{ flex: 1 }}></Pressable>
                <Animated.View style={{ width: sidebarWidth, height: "100%", backgroundColor: "black" }}>

                </Animated.View>
            </View> }
        </>
    )
}