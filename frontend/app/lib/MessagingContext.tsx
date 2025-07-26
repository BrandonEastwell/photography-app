import React, {createContext, useState, useContext, PropsWithChildren} from 'react';

const MessagingContext = createContext<{
    message: string | null;
    setMessage:  React.Dispatch<React.SetStateAction<string | null>>
}>({
    message: null,
    setMessage: value => null
});

export const MessageProvider = ({ children }: PropsWithChildren) => {
    const [message, setMessage] = useState<string | null>(null)

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