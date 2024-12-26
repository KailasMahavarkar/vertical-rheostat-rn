import React, { Component } from 'react';
import { View, PanResponder, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { NO_CAR_IMAGE } from '../utils/icons';
import { concatString } from '../utils/string';
import { testIdProps } from '../utils/testIdProps';

const propTypes = {
    /* Image width */
    width: PropTypes.number.isRequired,
    /** Aspect ratio of image */
    aspectRatio: PropTypes.oneOf(['21:9', '16:9', '4:3', '1:1']),
    /* Value for data-testing-id attribute */
    'data-testing-id': PropTypes.string.isRequired,
    /* Doubletap delay */
    doubleTapDelay: PropTypes.number,
    /* Maximum scale value for zoom feature */
    maxScale: PropTypes.number,
    /** Callback fire when mouse wheel event triggers. */
    onDoubleTap: PropTypes.func,
    /** Callback fire when pinch event triggers. */
    onPinch: PropTypes.func,
    /** Pinch provision enabled if true */
    shouldZoomOnPinch: PropTypes.bool,
    /* Callback fired when touchmove event triggers. */
    onTouchMove: PropTypes.func,
    /** Alternate Image link if the image doesn't exist */
    placeholderSrc: PropTypes.string,
    /** Default image if the image takes time to load */
    defaultSrc: PropTypes.any,
    /** Image url */
    src: PropTypes.string,
    /* Custom styles for image */
    style: PropTypes.oneOfType(PropTypes.object, PropTypes.array),
    /* Threshold scale value for first double tap functionality */
    threshold: PropTypes.number,
    /* Custom styles for image wrapper */
    wrapperStyle: PropTypes.oneOfType(PropTypes.object, PropTypes.array),
    /* Threshold swipe value for swiping functionality */
    thresholdSwipeValue: PropTypes.number,
};

const defaultProps = {
    width: 360,
    aspectRatio: '16:9',
    doubleTapDelay: 500,
    maxScale: 3,
    onDoubleTap: () => {},
    shouldZoomOnPinch: false,
    thresholdSwipeValue: 50,
    onPinch: () => {},
    onTouchMove: () => {},
    onTouchRelease: () => {},
    placeholderSrc: NO_CAR_IMAGE,
    defaultSrc: NO_CAR_IMAGE,
    src: '',
    style: null,
    threshold: 1.5,
    wrapperStyle: null,
};

const ASPECT_RATIO = {
    '21:9': 21 / 9,
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
};

const styles = StyleSheet.create({
    wrapperStyle: {
        overflow: 'hidden',
    },
    imageStyle: {
        position: 'absolute',
    },
});

class ZoomableImage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            scale: 1,
            initialX: null,
            initalY: null,
            top: 0,
            left: 0,
            hasSrc: props.src.length > 0,
            lastTap: 0,
            singlePressTimer: 0,
        };

        this.zoomGlobalStates = {
            isMoving: false,
            isZooming: false,
            initialDistance: null,
            initialZoom: 1,
            initialTopWithoutZoom: 0,
            initialLeftWithoutZoom: 0,
            initialTop: 0,
            initialLeft: 0,
            gestureType: null,
            gestureDirection: null,
        };

        this.height = this.getImageHeight(props.width);
    }

    componentDidUpdate(prevProps, prevState) {
        const { resetScale, width } = this.props;
        if (prevProps.resetScale !== resetScale) {
            this.setState({ scale: 1, top: 0, left: 0 });
        }

        if (prevProps.width !== width) {
            this.height = this.getImageHeight(width);
        }
    }

    getImageHeight = width => {
        const { aspectRatio } = this.props;
        return (1 / ASPECT_RATIO[aspectRatio]) * width;
    };

    maxOffset = (offset, imageDimension) => {
        const { scale } = this.state;
        const max = imageDimension - imageDimension * scale;
        if (max >= 0) {
            return 0;
        }
        return offset < max ? max : offset;
    };

    calcOffsetByZoom = () => {
        const { width } = this.props;
        const { scale } = this.state;
        const height = this.getImageHeight(width);

        const xDiff = width * scale - width;
        const yDiff = height * scale - height;
        return {
            left: -xDiff / 2,
            top: -yDiff / 2,
        };
    };

    handlePinch(x1, y1, x2, y2) {
        const dx = Math.abs(x1 - x2);
        const dy = Math.abs(y1 - y2);
        const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

        const center = {
            x: x1 > x2 ? x1 - (x1 - x2) / 2 : x2 - (x2 - x1) / 2,
            y: y1 > y2 ? y1 - (y1 - y2) / 2 : y2 - (y2 - y1) / 2,
        };

        const { scale, top, left } = this.state;
        const { width, maxScale } = this.props;
        const height = this.height;
        const {
            isZooming,
            initialDistance,
            initialZoom,
            initialTopWithoutZoom,
            initialLeftWithoutZoom,
        } = this.zoomGlobalStates;

        if (!isZooming) {
            const offsetByZoom = this.calcOffsetByZoom();
            this.setState({
                initialX: center.x,
                initialY: center.y,
            });
            this.zoomGlobalStates = {
                ...this.zoomGlobalStates,
                isZooming: true,
                initialDistance: distance,
                initialZoom: scale,
                initialTopWithoutZoom: top - offsetByZoom.top,
                initialLeftWithoutZoom: left - offsetByZoom.left,
            };
        } else {
            const touchZoom = distance / initialDistance;
            const scale =
                touchZoom * initialZoom > 1 ? touchZoom * initialZoom : 1;

            const offsetByZoom = this.calcOffsetByZoom();
            const left = initialLeftWithoutZoom * touchZoom + offsetByZoom.left;
            const top = initialTopWithoutZoom * touchZoom + offsetByZoom.top;

            if (scale < maxScale + 0.1) {
                this.setState({
                    scale,
                    left: left > 0 ? 0 : this.maxOffset(left, width),
                    top: top > 0 ? 0 : this.maxOffset(top, height),
                });
            }
        }
    }

    handleTouchMove(event, x, y, gestureState) {
        const { top, left, initialX, initialY, scale } = this.state;
        const { width, thresholdSwipeValue, onTouchMove } = this.props;
        const height = this.height;
        const { isMoving, initialTop, initialLeft } = this.zoomGlobalStates;
        const { dx } = gestureState;
        if (dx < 0 && -1 * dx > thresholdSwipeValue) {
            this.zoomGlobalStates.gestureDirection = 'left';
        } else if (dx > thresholdSwipeValue) {
            this.zoomGlobalStates.gestureDirection = 'right';
        } else {
            this.zoomGlobalStates.gestureDirection = null;
        }
        onTouchMove(event, scale, this.zoomGlobalStates.gestureDirection);
        if (!isMoving) {
            this.setState({
                initialX: x,
                initialY: y,
            });
            this.zoomGlobalStates = {
                ...this.zoomGlobalStates,
                isMoving: true,
                initialTop: top,
                initialLeft: left,
            };
        } else {
            const left = initialLeft + x - initialX;
            const top = initialTop + y - initialY;

            this.setState({
                left: left > 0 ? 0 : this.maxOffset(left, width),
                top: top > 0 ? 0 : this.maxOffset(top, height),
            });
        }
    }

    handlePanResponderMove = (event, gestureState) => {
        const { onPinch, onTouchMove, shouldZoomOnPinch } = this.props;
        const { scale } = this.state;
        const touches = event.nativeEvent.touches;
        const { isZooming } = this.zoomGlobalStates;
        const { vx, vy } = gestureState;
        if (Math.abs(vx) > 0 || Math.abs(vy) > 0) {
            if (touches.length === 2 && shouldZoomOnPinch) {
                this.zoomGlobalStates.gestureType = 'pinch';
                onPinch(event, scale);
                this.handlePinch(
                    touches[0].pageX,
                    touches[0].pageY,
                    touches[1].pageX,
                    touches[1].pageY
                );
            } else if (touches.length === 1 && !isZooming) {
                this.handleTouchMove(
                    event,
                    touches[0].pageX,
                    touches[0].pageY,
                    gestureState
                );
                this.zoomGlobalStates.gestureType = 'shift';
                onTouchMove(event);
            }
        }
    };

    getNextPositionValues = (nextScale, locationX, locationY) => {
        const { top, left, scale } = this.state;
        const incrementalScalePercentage = (nextScale - scale) / scale;
        const translateY = locationY * incrementalScalePercentage;
        const translateX = locationX * incrementalScalePercentage;
        const nextTop = top - translateY;
        const nextLeft = left - translateX;

        return { nextLeft, nextTop };
    };

    handleDoubleTap = e => {
        const { threshold, maxScale, onDoubleTap } = this.props;
        const { scale } = this.state;
        const { locationY, locationX } = e.nativeEvent;

        if (scale < threshold) {
            onDoubleTap(e, threshold);
            const { nextLeft, nextTop } = this.getNextPositionValues(
                threshold,
                locationX,
                locationY
            );

            this.setState({
                scale: threshold,
                left: nextLeft,
                top: nextTop,
            });
        } else if (scale >= threshold && scale < maxScale) {
            onDoubleTap(e, maxScale);
            const { nextLeft, nextTop } = this.getNextPositionValues(
                maxScale,
                locationX,
                locationY
            );

            this.setState({
                scale: maxScale,
                left: nextLeft,
                top: nextTop,
            });
        } else if (scale >= maxScale) {
            this.setState({ scale: 1, left: 0, top: 0 }, () => {
                onDoubleTap(e, 1);
            });
        }
    };

    handleSingleTap = e => {
        this.cancelSinglePressTimer();
        const { doubleTapDelay, onSingleTap } = this.props;
        const { lastTap } = this.state;
        const now = Date.now();
        if (lastTap && now - lastTap < doubleTapDelay) {
            this.handleDoubleTap(e);
        } else {
            this.setState({ lastTap: now });
            const timeout = setTimeout(() => {
                this.setState({ lastTap: 0 });
                if (onSingleTap) {
                    onSingleTap(e);
                }
            }, doubleTapDelay);
            this.setState({ singlePressTimer: timeout });
        }
    };

    cancelSinglePressTimer = () => {
        const { singlePressTimer } = this.state;
        if (singlePressTimer) {
            clearTimeout(singlePressTimer);
            this.setState({ singlePressTimer: 0 });
        }
    };
    handlePanResponderRelease = event => {
        const { onTouchRelease } = this.props;
        const { scale } = this.state;

        this.zoomGlobalStates.gestureType == 'shift' &&
            onTouchRelease &&
            onTouchRelease(
                event,
                scale,
                this.zoomGlobalStates.gestureDirection
            );
        if (!this.zoomGlobalStates.gestureType) {
            this.handleSingleTap(event);
        }
        this.zoomGlobalStates = {
            ...this.zoomGlobalStates,
            isMoving: false,
            isZooming: false,
            gestureType: null,
        };
    };

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: this.handlePanResponderMove,
            onPanResponderRelease: this.handlePanResponderRelease,
            onShouldBlockNativeResponder: () => true,
        });
    }

    handleOnError = () => {
        this.setState({ hasSrc: false });
    };

    render() {
        const {
            wrapperStyle,
            style,
            src,
            placeholderSrc,
            width,
            'data-testing-id': testingName,
            defaultSrc,
        } = this.props;
        const { top, hasSrc, left, scale } = this.state;
        const height = this.height;
        const imageSrc = hasSrc ? src : placeholderSrc;

        const imgWrapperStyle = [
            styles.wrapperStyle,
            wrapperStyle,
            {
                width,
                height,
            },
        ];

        const imgStyle = [
            styles.imageStyle,
            style,
            {
                top,
                left,
                width: width * scale,
                height: height * scale,
            },
        ];

        return (
            <View
                style={imgWrapperStyle}
                {...this._panResponder.panHandlers}
                {...testIdProps(
                    concatString(testingName, 'zoomable-image-wrapper')
                )}
            >
                <Image
                    style={imgStyle}
                    source={{ uri: imageSrc }}
                    onError={this.handleOnError}
                    defaultSource={defaultSrc}
                    {...testIdProps(
                        concatString(testingName, 'zoomable-image')
                    )}
                />
            </View>
        );
    }
}

ZoomableImage.propTypes = propTypes;
ZoomableImage.defaultProps = defaultProps;

export default ZoomableImage;
