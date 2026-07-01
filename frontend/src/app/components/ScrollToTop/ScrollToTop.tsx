import React, { FC, useEffect } from 'react';
import { useLocation } from "react-router-dom"

interface IProps {
	children: any,
}

const ScrollToTop: FC<IProps> = ({children}) => {
	const location = useLocation();
    const pathName = location.pathname;

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [pathName]);

	return <>{children}</>;
};

export default ScrollToTop;
