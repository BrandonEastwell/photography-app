import { Stack } from "expo-router";
import {AuthProvider} from "@/app/lib/AuthContext";
import {useFonts} from "expo-font";
import { View} from "react-native";
import PhotoUpload from "@/app/components/PhotoUpload";

export default function RootLayout() {
    const [loaded, error] = useFonts({
        'BethEllen-Regular': require("../assets/fonts/BethEllen-Regular.ttf"),
        'SpaceMono-Regular': require("../assets/fonts/SpaceMono-Regular.ttf"),
    });

    if (!loaded) {
        return null;
    }

    return (
        <View style={{flex: 1, backgroundColor: '#181a1b'}}>
            <AuthProvider>
                <Stack>
                    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                </Stack>
            </AuthProvider>
        </View>
    );
}
