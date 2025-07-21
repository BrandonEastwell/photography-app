import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default class AuthService {
    static async createSession() {
        const headers: Record<string, string> = {"Platform": Platform.OS}

        if (Platform.OS !== "web") {
            const sessionId = await SecureStore.getItemAsync('session_id');
            if (sessionId) headers["Session"] = sessionId
        }

        let res = await fetch(`${apiUrl}/session`, {
            method: "GET",
            credentials: 'include',
            headers
        })

        if (res.ok) {
            let { session_id } = await res.json()
            if (Platform.OS !== "web") {
                await SecureStore.setItemAsync("session_id", session_id)
            }
        }
    }

    static async refreshAuthToken() {
        const headers: Record<string, string> = {"Platform": Platform.OS}
        if (Platform.OS !== "web") {
            const sessionId = await SecureStore.getItemAsync('session_id');
            if (sessionId) headers["Session"] = sessionId
        }

        let res = await fetch(`${apiUrl}/refresh-token`, {
            method: "GET",
            headers,
            credentials: "include"
        })

        let data = await res.json()

        if (data.success) {
            await this.saveAuthToken(data.auth_token, data.auth_token_exp)
        }

        return data.success
    }

    static async saveAuthToken(authToken: string, authTokenExp: string) {
        if (Platform.OS !== "web") {
            await SecureStore.setItemAsync("auth_token", authToken)
            await SecureStore.setItemAsync("auth_token_exp", authTokenExp)
        }  else {
            await AsyncStorage.setItem("auth_token_exp", authTokenExp)
        }
    }

    static async isUserLoggedIn() {
        let authTokenExp;
        if (Platform.OS !== "web") {
            authTokenExp = await SecureStore.getItemAsync("auth_token_exp")
        } else {
            authTokenExp = await AsyncStorage.getItem("auth_token_exp")
        }

        if (!authTokenExp) return false

        const curTime = new Date()
        const expiry = new Date(authTokenExp)
        return curTime <= expiry;
    }
}