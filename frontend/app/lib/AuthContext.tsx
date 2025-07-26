import React, {createContext, useState, useEffect, useContext, PropsWithChildren} from 'react';
import AuthService from "@/app/lib/AuthService";
import Constants from "expo-constants";
import {Platform} from "react-native";
import * as SecureStore from "expo-secure-store";
import {useRouter} from "expo-router";
import {getReqHeaders} from "@/app/lib/Helpers";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

type User = { username: string, userId: number };

const AuthContext = createContext<{
    login: (user: User) => void;
    logout: () => void;
    user: User | null;
    authenticated: boolean
    isAuthenticated: () => Promise<boolean>;
}>({
    login: () => null,
    logout: () => null,
    user: null,
    authenticated: false,
    isAuthenticated: async () => false,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<User | null>(null)
    const [authenticated, setAuthenticated] = useState<boolean>(false)
    const router = useRouter()

    useEffect(() => {
        const initializeSession = async () => {
            const user = await AuthService.createSession()
            if (user) {
                setUser({ username: user.username, userId: user.userId })
                setAuthenticated(true)
            }
        }
        initializeSession()
    }, []);

    const isAuthenticated = async () => {
        const res = await AuthService.isUserLoggedInWithRefresh()
        setAuthenticated(res)
        return res
    }

    const logout = async () => {
        const headers = await getReqHeaders()

        try {
            const res = await fetch(`${apiUrl}/api/account/logout`, {
                credentials: "include",
                method: "POST",
                headers
            })

            if (res.ok) {
                await AuthService.deleteAuthToken()
                setUser(null)
                setAuthenticated(false)

                setTimeout(() => {
                    router.push('/auth/login')
                }, 300)
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            authenticated,
            isAuthenticated: async () => await isAuthenticated(),
            logout,
            login: (user: User) => setUser({ username: user.username, userId: user.userId}),
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);