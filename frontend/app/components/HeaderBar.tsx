import {Animated, Easing, Pressable, Text, View} from "react-native";
import React, {useEffect, useRef, useState} from "react";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AnimatedButton from "@/app/components/AnimatedButton";
import {useAuth} from "@/app/lib/AuthContext";

export default function HeaderBar({ containerWidth } : { containerWidth: number }) {
    const [showSidebar, setShowSidebar] = useState<boolean>(false)
    const sidebarWidth = useRef(new Animated.Value(0)).current;
    const titleSlide = useRef(new Animated.Value(0)).current;
    const { logout, isAuthenticated, authenticated } = useAuth()

    useEffect(() => {
        isAuthenticated
    }, []);

    const closeSidebar = () => {
        toggleMenu()
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
        ]).start(() => {
            setShowSidebar(false)
        });

    };

    const openSidebar = () => {
        toggleMenu()
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

    const animation = useRef(new Animated.Value(0)).current;
    const toggleMenu = () => {
        Animated.timing(animation, {
            toValue: showSidebar ? 0 : 1,
            duration: 150,
            useNativeDriver: false,
        }).start();
    };

    const topLineTransform = {
        transform: [
            {
                rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                }),
            },
            {
                translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 8.5], // adjust for bar spacing
                }),
            },
        ],
    };

    const middleLineOpacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
    });

    const bottomLineTransform = {
        transform: [
            {
                rotate: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '-45deg'],
                }),
            },
            {
                translateY: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -8.5],
                }),
            },
        ],
    };

    return (
        <>
            <View style={{ height: 40, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", zIndex: 1001 }}>
                <View style={{ position: "absolute", width: "100%", justifyContent: "center" }}>
                    <Animated.Text style={{ fontSize: 20, fontFamily: "BethEllen-Regular", color: 'white',
                        alignSelf: "center", marginHorizontal: "auto", transform: [{ translateX: titleSlide }] }}>Photography App</Animated.Text>
                </View>
                <Pressable onPress={() => showSidebar ? closeSidebar() : openSidebar()} style={{ alignSelf: "center",  padding: 15 }}>
                    <Animated.View style={[{
                        width: 20,
                        height: 2,
                        marginBottom: 4,
                        backgroundColor: 'white'
                    }, topLineTransform]} />
                    <Animated.View style={[{
                        width: 20,
                        height: 2,
                        marginBottom: 4,
                        backgroundColor: 'white'
                    }, { opacity: middleLineOpacity }]} />
                    <Animated.View style={[{
                        width: 20,
                        height: 2,
                        backgroundColor: 'white'
                    }, bottomLineTransform]} />
                </Pressable>
            </View>
            { showSidebar && <View style={{ position: "absolute", flexDirection: "row", width: "100%",
                height: "100%", zIndex: 1000 }}>
                <Pressable onPress={() => closeSidebar()} style={{ flex: 1 }}></Pressable>
                <Animated.View style={{ width: sidebarWidth, height: "100%", backgroundColor: '#121212',
                    borderLeftWidth: 0.5, borderColor: "rgba(179,179,179,0.74)" }}>
                    <View style={{ width: containerWidth * 0.4, height: "100%", flexDirection: "column", padding: 15, marginTop: 60 }}>
                        { authenticated &&
                            <AnimatedButton onClick={() => {
                                logout()
                                closeSidebar()
                            }} defaultBgColor={'transparent'}>
                                <MaterialIcons name="logout" size={20} color="white" />
                                <Text style={{ fontFamily: "SpaceMono-Regular", fontSize: 14, color: 'white' }}>Sign out</Text>
                            </AnimatedButton>
                        }
                    </View>
                </Animated.View>
            </View> }
        </>
    )
}
