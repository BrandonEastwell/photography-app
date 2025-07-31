import React, {createContext, useState, useEffect, useContext, PropsWithChildren} from 'react';
import AuthService from "@/app/lib/AuthService";
import Constants from "expo-constants";
import {useRouter} from "expo-router";
import {getReqHeaders} from "@/app/lib/Helpers";
import {Photo, UserProfile} from "@/app/lib/Types";
const apiUrl = Constants.expoConfig?.extra?.API_URL;

type User = { username: string, userId: number };

const AuthContext = createContext<{
    login: (user: User) => void;
    logout: () => void;
    authUser: Partial<UserProfile> | null;
    setAuthUser: React.Dispatch<React.SetStateAction<Partial<UserProfile> | null>>;
    authUserPhotos: Photo[] | null;
    setAuthUserPhotos: React.Dispatch<React.SetStateAction<Photo[] | null>>;
    authenticated: boolean;
    isAuthenticated: () => Promise<boolean>;
}>({
    login: () => null,
    logout: () => null,
    authUser: null,
    setAuthUser: () => null,
    authUserPhotos: null,
    setAuthUserPhotos: () => null,
    authenticated: false,
    isAuthenticated: async () => false,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [profile, setProfile] = useState<Partial<UserProfile> | null>(null)
    const [authenticated, setAuthenticated] = useState<boolean>(false)
    const [userPhotos, setUserPhotos] = useState<Photo[] | null>(null)
    const router = useRouter()

    useEffect(() => {
        const initializeSession = async () => {
            const user = await AuthService.createSession()
            if (user) {
                setProfile({ username: user.username, user_id: user.userId })
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
                setProfile(null)
                setAuthenticated(false)

                setTimeout(() => {
                    router.push('/auth/login')
                }, 300)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const login = async (user: User) => {
        setProfile({ username: user.username, user_id: user.userId})
        setAuthenticated(true)
    }

    return (
        <AuthContext.Provider value={{
            authUser: profile,
            setAuthUser: setProfile,
            authUserPhotos: userPhotos,
            setAuthUserPhotos: setUserPhotos,
            authenticated,
            isAuthenticated: async () => await isAuthenticated(),
            logout,
            login,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);