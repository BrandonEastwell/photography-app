import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import FileUpload from '../components/FileUpload'
import {Pressable} from "react-native";
import {Entypo} from "@expo/vector-icons";

export default function TabLayout() {
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
                    tabBarButton: () => <FileUpload />
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
