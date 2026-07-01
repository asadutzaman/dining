import React, { FC, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../../../context/auth/auth.context";
import { CLEAR_AUTH_STATE, REMOVE_TOKEN } from "../../../../context/auth/auth.types";

const Logout: FC = props => {
    const navigate = useNavigate();
    const { dispatchAuth } = useContext(AuthContext)

    useEffect(() => {
        dispatchAuth({ type: REMOVE_TOKEN })
        dispatchAuth({ type: CLEAR_AUTH_STATE })
        localStorage.removeItem('redirectUri');
        localStorage.removeItem('redirectUrl');
        navigate('/auth/login');
        window.location.reload();
    }, []);

    return (
        <>
        </>
    );

}

export default Logout;