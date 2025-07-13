import {Redirect, Tabs} from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import FileUpload from '../components/FileUpload'
import {Pressable} from "react-native";
import {Entypo} from "@expo/vector-icons";
import AuthService from "@/app/lib/AuthService";
import {useState} from "react";

export default function TabLayout() {
    const [showUpload, setShowUpload] = useState(false)

    const onUploadClick = async () => {
        const isLoggedIn = await AuthService.isUserLoggedIn()

        if (isLoggedIn) {
            setShowUpload(true)
            return <FileUpload showUpload={showUpload} />
        }

        let res = await AuthService.refreshAuthToken()
        if (res.success) return <FileUpload showUpload={showUpload} />
        return <Redirect href="/(auth)/login"></Redirect>
    }

    return (
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
        </Tabs>
    );
}
