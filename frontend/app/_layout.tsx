import { Stack } from "expo-router";
import {AuthProvider} from "@/app/lib/AuthContext";
import {useFonts} from "expo-font";
import {MessageProvider} from "@/app/lib/MessagingContext";
import {LoadingProvider} from "@/app/lib/LoadingContext";
import {useEffect, useState} from "react";
import Constants from "expo-constants";
import {Modal, View} from "react-native";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'BethEllen-Regular': require("../assets/fonts/BethEllen-Regular.ttf"),
        'SpaceMono-Regular': require("../assets/fonts/SpaceMono-Regular.ttf"),
    });
    const [serverAwake, setServerAwake] = useState<boolean | null>(null)

    if (!loaded) {
        return null;
    }

    useEffect(() => {
        const pingServer = async () => {
            let warningTimer = setTimeout(() => {
                setServerAwake(false)
            }, 2000);

            try {
                await fetch(`${apiUrl}/api/ping`)
            } catch (e) {
                console.error(e)
            } finally {
                clearTimeout(warningTimer)
                setServerAwake(true)
            }
        }
        pingServer()
    }, []);

    if (serverAwake) {
        return (
            <LoadingProvider>
                <MessageProvider>
                    <AuthProvider>
                        <Stack>
                            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                        </Stack>
                    </AuthProvider>
                </MessageProvider>
            </LoadingProvider>
        )
    }

    if (!serverAwake) {
        return (
            <View style={{ width: "100%", height: "100%", backgroundColor: "black" }}>

            </View>
        )
    }
}
