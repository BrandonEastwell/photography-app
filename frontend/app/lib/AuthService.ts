import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default class AuthService {
    static async createSession() {
        await fetch("http://127.0.0.1:8000/session", {
            method: "GET",
            credentials: "include"
        })
    }

    static async refreshAuthToken() {
        let res = await fetch("http://127.0.0.1:8000/refresh-token", {
            method: "GET",
            credentials: "include"
        })

        if (res.ok) {
            let { authToken, authTokenExp } = await res.json()
            if (Platform.OS == "web") {
                await AsyncStorage.setItem("auth_token", authToken)
                await AsyncStorage.setItem("auth_token_exp", authTokenExp)
            } else {
                await SecureStore.setItemAsync("auth_token", authToken)
                await SecureStore.setItemAsync("auth_token_exp", authTokenExp)
            }

            return { "success": true }
        }

        return { "success": false }

    }

    static async isUserLoggedIn() {
        let authTokenExp
        if (Platform.OS == "web") {
            authTokenExp = await AsyncStorage.getItem("auth_token_exp")
        } else {
            authTokenExp = await SecureStore.getItemAsync("auth_token_exp")
        }

        if (!authTokenExp) return false

        const curTime = new Date()
        const expiry = new Date(authTokenExp)
        return curTime <= expiry;
    }
}