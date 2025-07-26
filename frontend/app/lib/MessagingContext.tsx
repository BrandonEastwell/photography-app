import React, {createContext, useState, useContext, PropsWithChildren} from 'react';

const MessagingContext = createContext<{
    message: { message: string, error: boolean } | null;
    setMessage:  React.Dispatch<React.SetStateAction<{ message: string, error: boolean } | null>>
}>({
    message: null,
    setMessage: value => null
});

export const MessageProvider = ({ children }: PropsWithChildren) => {
    const [message, setMessage] = useState<{ message: string, error: boolean } | null>(null)

    return (
        <MessagingContext.Provider value={{
            message,
            setMessage
        }}>
            {children}
        </MessagingContext.Provider>
    )
}

export const useMessage = () => useContext(MessagingContext);