import {Platform} from "react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

async function fetchRequest(resource: string , data: any, headers: Record<string, string>) {
    headers["Platform"] = Platform.OS
    return await fetch(`${apiUrl}${resource}`, {
        method: "POST",
        body: data,
        headers,
        credentials: "include",
    })
}

export async function getReqHeaders() {
    const headers: Record<string, string> = { "Platform": Platform.OS }
    if (Platform.OS !== "web") {
        const sessionId = await SecureStore.getItemAsync('session_id');
        if (sessionId) headers["Session"] = sessionId;
        const token = await SecureStore.getItemAsync("auth_token") as string;
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers
}