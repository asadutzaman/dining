import { CONSTANT_COMMON } from "../constants";

export default class StorageService {
    public getAccessToken = () => {
        return localStorage.getItem("accessToken")
    }

    public getRefreshToken = () => {
        return localStorage.getItem("refreshToken")
    }

    public setAccessToken = (token: any) => {
        localStorage.setItem('accessToken', token);
    }

    public setRefreshToken = (token: any) => {
        localStorage.setItem('refreshToken', token);
    }

    public getAccessTokenExpiredTime = () => {
        return localStorage.getItem('accessTokenExpiredTime');
    }

    public setAccessTokenExpiredTime = () => {
        const currentTime = Date.now();
        const expiredTime = currentTime + CONSTANT_COMMON.TOKEN_REFRESH_INTERVAL;
        localStorage.setItem('accessTokenExpiredTime', String(expiredTime));
    }

    public removeAccessToken = () => {
        localStorage.removeItem("accessToken")
    }

    public removeRefreshToken = () => {
        localStorage.removeItem("refreshToken")
    }

    public clearStorage = () => {
        localStorage.clear();
    }
}
