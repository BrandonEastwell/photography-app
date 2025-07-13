import { Stack } from "expo-router";
import AuthService from "@/app/lib/AuthService";
import {AuthProvider} from "@/app/lib/AuthContext";

export default function RootLayout() {

    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/register" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </AuthProvider>
    )
}
