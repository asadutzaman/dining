import React, { FC } from 'react';
import classNames from 'classnames';
import Scrollbars from 'react-custom-scrollbars-2';
import './CustomScrollbar.scss';

interface Props {
    children: any,
    className?: string;
    autoHide?: boolean;
    autoHideTimeout?: number;
    autoHideDuration?: number;
    autoHeight?: boolean;
    autoHeightMax?: string | number;
    hideTracksWhenNotNeeded?: boolean;
    hideHorizontalTrack?: boolean;
    hideVerticalTrack?: boolean;
    autoHeightMin?: number | string;
    updateAfterMountMs?: number;
}

const CustomScrollbar: FC<Props> = (props: Props) => {
    const {
        children,
        className,
        autoHeight,
        autoHeightMin = '0',
        autoHeightMax = '100%',
        autoHide = false,
        autoHideTimeout = 1000,
        autoHideDuration = 200,
        hideTracksWhenNotNeeded = true,
    } = props;

    const refScrollbar = React.createRef<Scrollbars>();

    const renderTrack = (track: 'scrollbar-track-vertical' | 'scrollbar-track-horizontal', hideTrack: boolean | undefined, passedProps: any) => {
        if (passedProps.style && hideTrack) {
            passedProps.style.display = 'none';
        }

        return <div {...passedProps} className={track} />;
    };

    const renderThumb = (thumb: 'scrollbar-thumb-horizontal' | 'scrollbar-thumb-vertical', passedProps: any) => {
        return <div {...passedProps} className={thumb} />;
    };

    const renderTrackHorizontal = (passedProps: any) => {
        return renderTrack('scrollbar-track-horizontal', props.hideHorizontalTrack, passedProps);
    };

    const renderTrackVertical = (passedProps: any) => {
        return renderTrack('scrollbar-track-vertical', props.hideVerticalTrack, passedProps);
    };

    const renderThumbHorizontal = (passedProps: any) => {
        return renderThumb('scrollbar-thumb-horizontal', passedProps);
    };

    const renderThumbVertical = (passedProps: any) => {
        return renderThumb('scrollbar-thumb-vertical', passedProps);
    };

    const renderView = (passedProps: any) => {
        return <div {...passedProps} className="scrollbar-container" />;
    };

    return (
        <Scrollbars
            className={classNames('custom-scrollbar', className)}

            autoHide={autoHide}
            autoHideTimeout={autoHideTimeout}
            autoHideDuration={autoHideDuration}
            hideTracksWhenNotNeeded={hideTracksWhenNotNeeded}
            // These autoHeightMin & autoHeightMax options affect firefox and chrome differently.
            // Before these where set to inherit but that caused problems with cut of legends in firefox
            autoHeight={autoHeight}
            autoHeightMax={autoHeightMax}
            autoHeightMin={autoHeightMin}

            renderView={renderView}
            renderTrackHorizontal={renderTrackHorizontal}
            renderTrackVertical={renderTrackVertical}
            renderThumbHorizontal={renderThumbHorizontal}
            renderThumbVertical={renderThumbVertical}
        >
            {children}
        </Scrollbars>
    );
}

export default CustomScrollbar;