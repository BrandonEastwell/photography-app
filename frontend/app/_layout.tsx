import { Stack } from "expo-router";
import AuthService from "@/app/lib/AuthService";
import {useEffect} from "react";

export default function RootLayout() {
    useEffect(() => {
        AuthService.createSession()
    }, []);

    return (
        <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    )
}
