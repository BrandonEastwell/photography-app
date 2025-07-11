import * as SecureStore from 'expo-secure-store';

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
            await SecureStore.setItemAsync("auth_token", authToken)
            await SecureStore.setItemAsync("auth_token_exp", authTokenExp)
            return { authToken, authTokenExp }
        }

    }

    static async isUserLoggedIn() {
        let authTokenExp = await SecureStore.getItemAsync("auth_token_exp")
        if (!authTokenExp) return false

        const curTime = new Date()
        const expiry = new Date(authTokenExp)
        return curTime <= expiry;
    }
}