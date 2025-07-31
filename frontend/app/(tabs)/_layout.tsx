import {Tabs, useRouter} from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import PhotoUpload from '../components/PhotoUpload'
import {Pressable, View, Text, Animated} from "react-native";
import {Entypo} from "@expo/vector-icons";
import useUpload from "@/app/lib/useUpload";
import React, {useEffect, useRef, useState} from "react";
import HeaderBar from "@/app/components/HeaderBar";
import {useAuth} from "@/app/lib/AuthContext";
import {useMessage} from "@/app/lib/MessagingContext";

export default function TabLayout() {
    const [containerWidth, setContainerWidth] = useState(0);
    const { onUploadClick, showUploadScreen, setShowUploadScreen } = useUpload();
    const { authUser, isAuthenticated } = useAuth();
    const { message, setMessage } = useMessage()
    const router = useRouter();
    const animatedMessage = useRef(new Animated.Value(0)).current;

    const onProfileClick = async () => {
        const isUserAuthenticated = await isAuthenticated()
        if (!isUserAuthenticated) return router.push("/auth/login")
        if (authUser && authUser.username) {
            return router.push({
                pathname: `/[username]`,
                params: {
                    username: encodeURIComponent(authUser.username),
                }
            })
        }
    }

    const onIndexClick = () => {
        return router.push("/(tabs)")
    }

    const animateInMessage = () => {
        Animated.timing(animatedMessage, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false
        }).start()
    }

    const animateOutMessage = () => {
        Animated.timing(animatedMessage, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false
        }).start(() => setMessage(null))
    }

    const opacity = animatedMessage.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1]
    });

    useEffect(() => {
        if (message) {
            animateInMessage()
            setTimeout(() => {
                animateOutMessage()
            }, 9000);
        }
    }, [message]);

    return (
        <View style={{ flex: 1, backgroundColor: '#181a1b', width: "100%", alignItems: "center" }}>
            <View style={{ flex: 1, maxWidth: 800, width: "100%", overflow: "hidden" }}
                  onLayout={(event) => {
                      const { width } = event.nativeEvent.layout;
                      setContainerWidth(width);
                  }}>
                <HeaderBar containerWidth={containerWidth} />
                { message &&
                    <Animated.View style={{
                        position: "absolute",
                        top: "80%",
                        opacity,
                        alignSelf: "center",
                        backgroundColor: 'rgba(56,52,52,0.86)',
                        borderRadius: 12,
                        zIndex: 999,
                        maxWidth: 275,
                        borderBottomWidth: 1,
                        borderColor: message.error ? "red" : '#3091fc'
                    }}>
                        <Text style={{ paddingVertical: 10, paddingHorizontal: 20, fontSize: 14, textAlign: "center",
                            fontFamily: "SpaceMono-Regular", color: 'rgba(229,229,229,0.97)' }}>{ message.message }</Text>
                    </Animated.View>
                }
                <Tabs
                    screenOptions={{
                        tabBarActiveTintColor: '#ffffff',
                        headerShown: false,
                        tabBarShowLabel: false,
                        tabBarStyle: {
                            backgroundColor: '#181a1b',
                            borderTopWidth: 1,
                            borderColor: '#212121',
                            zIndex: 100
                        }
                    }}
                >
                    <Tabs.Screen
                        name="index"
                        options={{
                            tabBarButton: () => (
                                <Pressable onPress={onIndexClick} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: 5 }}>
                                    <Entypo name="home" size={24} color="white" />
                                </Pressable>
                            )
                        }}
                    />
                    <Tabs.Screen
                        name="upload"
                        options={{
                            tabBarButton: () => (
                                <Pressable onPress={onUploadClick} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: 5 }}>
                                    <Entypo name="circle-with-plus" size={24} color="#ffffff" />
                                </Pressable>
                            )
                        }}
                    />
                    <Tabs.Screen
                        name="profile"
                        options={{
                            tabBarButton: () => (
                                <Pressable onPress={onProfileClick} style={{ justifyContent: 'center', alignItems: 'center', flex: 1, padding: 5 }}>
                                    <Ionicons name={'person-circle-sharp'} color={'#ffffff'} size={24} />
                                </Pressable>
                            )
                        }}
                    />
                    <Tabs.Screen name="[username]" options={{ href: null }}></Tabs.Screen>
                    <Tabs.Screen name="auth/login" options={{ href: null }}></Tabs.Screen>
                    <Tabs.Screen name="auth/register" options={{ href: null }}></Tabs.Screen>
                </Tabs>
                { showUploadScreen && <PhotoUpload setShowUpload={setShowUploadScreen} /> }
            </View>
        </View>
    );
}
