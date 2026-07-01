import React, {FC} from 'react'

interface IProps {
    component: any,
    children?: any,
    [key: string]: any,
}

const LoadComponent: FC<IProps> = props => {
    const { children, component: Component, ...restProps } = props;

    return (
        <>
            <Component {...restProps}  />
        </>
    );
}

export default LoadComponent;