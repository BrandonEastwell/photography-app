import { Stack } from "expo-router";
import AuthService from "@/app/lib/AuthService";

export default function RootLayout() {
    AuthService.createSession()

    return (
        <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    )
}
