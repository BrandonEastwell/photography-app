import React, {createContext, useState, useContext, PropsWithChildren} from 'react';

const LoadingContext = createContext<{
    loading: boolean;
    setLoading:  React.Dispatch<React.SetStateAction<boolean>>
}>({
    loading: false,
    setLoading: () => false
});

export const LoadingProvider = ({ children }: PropsWithChildren) => {
    const [loading, setLoading] = useState<boolean>(false)

    return (
        <LoadingContext.Provider value={{
            loading,
            setLoading
        }}>
            {children}
        </LoadingContext.Provider>
    )
}

export const useLoading = () => useContext(LoadingContext);