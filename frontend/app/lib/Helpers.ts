import {Platform} from "react-native";
import Constants from "expo-constants";
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