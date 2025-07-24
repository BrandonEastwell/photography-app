import React, {createContext, useState, useEffect, useContext, PropsWithChildren} from 'react';
import AuthService from "@/app/lib/AuthService";

type User = { username: string, userId: number };

const AuthContext = createContext<{
    login: (user: User) => void;
    logout: () => void;
    user: User | null;
    isAuthenticated: () => Promise<boolean>;
}>({
    login: () => null,
    logout: () => null,
    user: null,
    isAuthenticated: async () => false,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const initializeSession = async () => {
            const user = await AuthService.createSession()
            if (user) setUser({ username: user.username, userId: user.userId})
        }
        initializeSession()
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: () => AuthService.isUserLoggedInWithRefresh(),
            logout: () => setUser(null),
            login: (user: User) => setUser({ username: user.username, userId: user.userId}),
        }} >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);