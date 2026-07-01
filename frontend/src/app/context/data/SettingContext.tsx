import React, { createContext, useState, useEffect } from 'react'
// import { OptionApi } from "../../api";

const initialState = {
    isLoading: false,
    isLoaded: false,
    fields: {
        // General Setting
        site_name: null,
        contact_address: null,
        copyright: null,

        // Email Setting
        admin_sender_name: null,
        admin_sender_email: null,

        // Notification Setting
        send_email_notification: null,
        send_sms_notification: null,
        send_push_notification: null,
    }
};

export const SettingContext = createContext<any>(initialState);

export const SettingProvider = ({ children }: any) => {
    const [isLoading, setIsLoading] = useState<boolean>(initialState.isLoading);
    const [isLoaded, setIsLoaded] = useState<boolean>(initialState.isLoaded);
    const [fields, setFields] = useState<any>(initialState.fields);

    useEffect(() => {
        loadSetting();
    }, []);

    const loadSetting = async () => {
        // setIsLoading(true);
        // OptionApi.load()
        //     .then((res: any) => {
        //         setFields(res.data);
        //     })
        //     .finally(() => {
        //         setIsLoaded(true);
        //         setIsLoading(false);
        //     });
    }

    const updateSettings = (values: any) => {
        setFields((prevState: any) => ({
            ...prevState,
            ...values
        }));
    };

    const contextValue = {
        isLoading, isLoaded, fields, setFields, updateSettings
    };

    return (
        <SettingContext.Provider value={contextValue}>
            {children}
        </SettingContext.Provider>
    );
};

export default SettingProvider;
