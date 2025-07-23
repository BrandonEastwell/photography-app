import {Tabs} from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import PhotoUpload from '../components/PhotoUpload'
import {Pressable, View} from "react-native";
import {Entypo} from "@expo/vector-icons";
import useUpload from "@/app/lib/useUpload";
import React from "react";
import HeaderBar from "@/app/components/HeaderBar";

export default function TabLayout() {
    const { onUploadClick, showUploadScreen, setShowUploadScreen } = useUpload()

    return (
        <View style={{ flex: 1, backgroundColor: '#181a1b', maxWidth: 800, width: "100%", alignSelf: "center", overflow: "hidden" }}>
            <HeaderBar />
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
                        tabBarIcon: () => (
                            <Pressable style={{ justifyContent: 'center', alignItems: 'center', flex: 1, top: 5 }}>
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
                        tabBarIcon: () => (
                            <Pressable style={{ justifyContent: 'center', alignItems: 'center', flex: 1, top: 5  }}>
                                <Ionicons name={'person-circle-sharp'} color={'#ffffff'} size={24} />
                            </Pressable>
                        )
                    }}
                />
                <Tabs.Screen name="auth/login" options={{ href: null }}></Tabs.Screen>
                <Tabs.Screen name="auth/register" options={{ href: null }}></Tabs.Screen>
            </Tabs>
            { showUploadScreen && <PhotoUpload setShowUpload={setShowUploadScreen} /> }
        </View>
    );
}
