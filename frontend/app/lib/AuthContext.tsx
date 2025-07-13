import React, {createContext, useState, useEffect, useContext, PropsWithChildren} from 'react';
import AuthService from "@/app/lib/AuthService";

const AuthContext = createContext<{
    login: () => void;
    logout: () => void;
    user: string | null;
    isLoading: boolean;
    isAuthenticated: () => Promise<boolean>;
}>({
    login: () => null,
    logout: () => null,
    user: null,
    isLoading: false,
    isAuthenticated: async () => false,
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        AuthService.createSession()
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: () => AuthService.isUserLoggedIn(),
        logout: () => null, login: () => null,  isLoading, }} >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);