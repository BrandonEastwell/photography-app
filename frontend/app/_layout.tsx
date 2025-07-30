import { Stack } from "expo-router";
import {AuthProvider} from "@/app/lib/AuthContext";
import {useFonts} from "expo-font";
import {MessageProvider} from "@/app/lib/MessagingContext";
import {LoadingProvider} from "@/app/lib/LoadingContext";

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'BethEllen-Regular': require("../assets/fonts/BethEllen-Regular.ttf"),
        'SpaceMono-Regular': require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    if (!loaded) {
        return null;
    }

    return (
        <LoadingProvider>
            <MessageProvider>
                <AuthProvider>
                    <Stack>
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                    </Stack>
                </AuthProvider>
            </MessageProvider>
        </LoadingProvider>
    );
}
