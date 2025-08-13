import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import {getReqHeaders} from "@/app/lib/Helpers";

const apiUrl = Constants.expoConfig?.extra?.API_URL;

export default class AuthService {
    static async createSession() {
        const headers = await getReqHeaders()
        let res = await fetch(`${apiUrl}/session`, {
            method: "GET",
            credentials: 'include',
            headers
        })

        const { success, session_id, user } = await res.json()
        if (success) {
            if (Platform.OS !== "web") await SecureStore.setItemAsync("session_id", String(JSON.stringify(session_id)))
            if (user) return { username: user.username, userId: user.user_id }
        }
    }

    static async refreshAuthToken() {
        const headers = await getReqHeaders()
        try {
            let res = await fetch(`${apiUrl}/refresh-token`, {
                method: "GET",
                headers,
                credentials: "include"
            })

            let data = await res.json()
            if (data.success) {
                await this.saveAuthToken(JSON.stringify(data.auth_token), JSON.stringify(data.auth_token_exp))
            }

            return data.success
        } catch (e) {
            console.error(e)
        }
    }

    static async saveAuthToken(authToken: string | number, authTokenExp: string | number) {
        if (Platform.OS !== "web") {
            await SecureStore.setItemAsync("auth_token", String(authToken))
            await SecureStore.setItemAsync("auth_token_exp", String(authTokenExp))
        }  else {
            await AsyncStorage.setItem("auth_token_exp", String(authTokenExp))
        }
    }

    static async deleteAuthToken() {
        if (Platform.OS !== "web") {
            await SecureStore.deleteItemAsync("auth_token")
            await SecureStore.deleteItemAsync("auth_token_exp")
        }  else {
            await AsyncStorage.removeItem("auth_token_exp")
        }
    }

    static async isUserLoggedInWithRefresh() {
        const isTokenExpired = await AuthService.isTokenExpired()
        if (isTokenExpired) {
            let isAuthRefreshed: boolean = await AuthService.refreshAuthToken()
            if (!isAuthRefreshed) return false
        }
        return true
    }

    static async isTokenExpired() {
        let authTokenExp;
        try {
            if (Platform.OS !== "web") authTokenExp = await SecureStore.getItemAsync("auth_token_exp")
            else authTokenExp = await AsyncStorage.getItem("auth_token_exp")
            if (authTokenExp !== undefined) return true

            const curTime = new Date()
            const expiry = new Date(authTokenExp)
            return curTime >= expiry;
        } catch (error) {
            console.error(error)
            return true
        }
    }
}