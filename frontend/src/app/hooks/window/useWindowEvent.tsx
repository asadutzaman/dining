import { useEffect } from "react";

const w = typeof window !== 'undefined'

export function useWindowEvent(event: string, callback: () => void) {
    useEffect(() => {
        if (!w) return
        window.addEventListener(event, callback);
        return () => window.removeEventListener(event, callback);
    }, [event, callback]);
}
