import { Tabs } from 'expo-router';

import Ionicons from '@expo/vector-icons/Ionicons';
import FileUpload from '../components/FileUpload'
import {Pressable} from "react-native";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#ffd33d',
                headerShown: false,
                tabBarShowLabel: false
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Pressable style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                        </Pressable>
                    ),
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="upload"
                options={{
                    tabBarButton: () => <FileUpload />,
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <Pressable style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                        </Pressable>
                    ),
                    headerShown: false
                }}
            />
        </Tabs>
    );
}
