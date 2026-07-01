import React, { createContext, useState } from 'react'

const initialState = {
    notificationCount: 0
};

export const CountContext = createContext<any>(initialState);

export const CountProvider = ({ children }: any) => {
    const [notificationCount, setNotificationCount] = useState<any>(initialState.notificationCount);

    const contextValue = {
        notificationCount, setNotificationCount
    };

    return (
        <CountContext.Provider value={contextValue}>
            {children}
        </CountContext.Provider>
    );
};

export default CountProvider;
