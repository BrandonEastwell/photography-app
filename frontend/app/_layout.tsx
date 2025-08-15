import { Stack } from "expo-router";
import {AuthProvider} from "@/app/lib/AuthContext";
import {useFonts} from "expo-font";
import {MessageProvider} from "@/app/lib/MessagingContext";
import {LoadingProvider} from "@/app/lib/LoadingContext";
import React, {useEffect, useState} from "react";
import Constants from "expo-constants";
import {View, Text} from "react-native";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default function RootLayout() {
    const [loaded] = useFonts({
        'BethEllen-Regular': require("../assets/fonts/BethEllen-Regular.ttf"),
        'SpaceMono-Regular': require("../assets/fonts/SpaceMono-Regular.ttf"),
    });
    const [serverAwake, setServerAwake] = useState<boolean | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    useEffect(() => {
        const pingServer = async () => {
            const warningTimer = setTimeout(() => {
                setServerAwake(false)
                setMessage("Backend is inactive, spinning up (may take a minute)")
            }, 3000);

            try {
                await fetch(`${apiUrl}/ping`)
            } catch (e) {
                console.error(e)
                setMessage("Backend API is down or unavailable (free hosting issues)")
            } finally {
                clearTimeout(warningTimer)
                setServerAwake(true)
                setMessage(null)
            }
        }
        pingServer()
    }, []);

    if (!loaded) return null;

    return (
        <LoadingProvider>
            <MessageProvider>
                <AuthProvider>
                    {serverAwake === true && (
                        <Stack>
                            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
                        </Stack>
                    )}

                    {serverAwake === false && (
                        <View style={{ width: "100%", height: "100%", backgroundColor: '#181a1b', flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <Text style={{ paddingVertical: 10, paddingHorizontal: 20, fontSize: 24, textAlign: "center",
                                fontFamily: "SpaceMono-Regular", color: 'rgba(229,229,229,0.97)' }}>{ message }</Text>
                        </View>
                    )}
                </AuthProvider>
            </MessageProvider>
        </LoadingProvider>
    )
}

