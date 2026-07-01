import {useContext, useEffect, useState} from 'react'
import {AuthContext} from "../../context/auth/auth.context";

export const usePermissionContext = () => {
    const { scopes } = useContext(AuthContext)
    const [isPermissionLoaded, setIsPermissionLoaded] = useState(false);

    useEffect(() => {
        if (scopes?.length) {
            setIsPermissionLoaded(true)
        }
    }, [scopes]);

    const hasPermission = (permission: any) => {
        if (permission === '' || permission === null || permission === undefined) {
            return true
        }
        else if (isPermissionLoaded && permission) {
            return scopes.includes(permission);
        }
        return false
    }

    return { isPermissionLoaded, hasPermission }
}