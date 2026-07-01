import { useEffect } from 'react'
import { useNavigate } from "react-router-dom";

const w = typeof window !== 'undefined'

export const useWindowStorageEvent = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!w) return
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [])

    const handleStorageChange = (event: any) => {
        if (event.oldValue === event.newValue && event.storageArea !== localStorage) {
            return;
        }

        if (event.key === "refreshToken" && event.newValue) {
            doStorageChangeLogin();
        }

        if (event.key === "refreshToken" && event.newValue === null) {
            doStorageChangeLogout();
        }
    }

    const doStorageChangeLogin = () => {
        refreshPage();
    }

    const doStorageChangeLogout = () => {
        refreshPage();
    }

    const refreshPage = () => {
        navigate(0);
    }
}