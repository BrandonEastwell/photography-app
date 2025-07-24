import React, {createContext, useState, useEffect, useContext, PropsWithChildren} from 'react';
import AuthService from "@/app/lib/AuthService";

const AuthContext = createContext<{
    login: () => void;
    logout: () => void;
    user: { username: string, userId: number } | null;
    isAuthenticated: () => Promise<boolean>;
}>({
    login: () => null,
    logout: () => null,
    user: null,
    isAuthenticated: async () => false,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        AuthService.createSession()
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: () => AuthService.isUserLoggedIn(),
            logout: () => null,
            login: () => null,
        }} >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);