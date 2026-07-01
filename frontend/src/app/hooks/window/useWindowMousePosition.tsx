import { useState, useEffect } from 'react'

const w = typeof window !== 'undefined'

const getSize = () => ({
    x: 0,
    y: 0,
})

export const useWindowMousePosition = () => {
    const [windowMousePosition, setWindowMousePosition] = useState(getSize)

    const handleMouseMove = (e: any) => {
        setWindowMousePosition({
            x: e.pageX,
            y: e.pageY
        });
    }

    useEffect(() => {
        if (!w) return
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    return windowMousePosition
}
