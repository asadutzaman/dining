import { useState, useEffect } from "react";
import { Grid } from "antd";

function useResponsive() {
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();

    const [isMobileXs, setIsMobileXs] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const [isAndroid, setIsAndroid] = useState(false);
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        detectDeviceHandler();
    }, []);

    useEffect(() => {
        breakpointDetectHandler();
    }, [screens]);

    const breakpointDetectHandler = () => {
        const isMobile = ((screens?.xs || screens?.sm) && (!screens.md)) ?? false;
        const isMobileXs = ((screens?.xs)) ?? false;
        const isTablet = ((screens?.md) && (!screens.lg)) ?? false;
        const isDesktop = (screens?.lg || screens?.xl || screens?.xxl) ?? false;

        setIsMobile(isMobile);
        setIsMobileXs(isMobileXs);
        setIsTablet(isTablet);
        setIsDesktop(isDesktop);
    }

    const detectDeviceHandler = () => {
        const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
        const isAndroid = () => Boolean(userAgent.match(/Android/i));
        const isIos = () => Boolean(userAgent.match(/iPhone|iPad|iPod/i));

        setIsAndroid(isAndroid);
        setIsIos(isIos);
    }

    return {
        isMobileXs,
        isMobile,
        isTablet,
        isDesktop,
        isAndroid,
        isIos,
    };
}

export default useResponsive;