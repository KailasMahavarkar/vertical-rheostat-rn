import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, PanResponder } from 'react-native';
import theme from './theme';
import PropTypes from 'prop-types';
import { linearAlgorithm } from './algorithm';
import {
    clampRange,
    offsetToPercentage,
    percentToRheostatSize,
    offsetToRheostatSize,
    getClosestIndex,
} from './utils';

const CONSTANTS = {
    TRIANGLE_SIZE_X: 6,
    TRIANGLE_SIZE_Y: 6,
    SLIDER_SIZE: 24,
    HITSLOP: { left: 5, right: 5, top: 5, bottom: 5 },
};

const propTypes = {
    /* The value of the top handle */
    topHandleValue: PropTypes.number.isRequired,
    /* The value of the bottom handle */
    bottomHandleValue: PropTypes.number.isRequired,
    /* The minimum range value */
    minRange: PropTypes.number.isRequired,
    /* The maximum range value */
    maxRange: PropTypes.number.isRequired,
    /* when delta is 0 both handle overlap completely, when delta equals sliderSize both handle will never overlap(in terms of UI)  */
    sliderDelta: PropTypes.number,
    /* The algorithm to be used */
    algorithm: PropTypes.object,
    /* The width of the rheostat */
    rheostatWidth: PropTypes.number.isRequired,
    /* The height of the rheostat */
    rheostatHeight: PropTypes.number.isRequired,
    /* The snapping points (should be valid number between minRange and maxRange inclusive) */
    snapPoints: PropTypes.arrayOf(PropTypes.number),
    /* The suffix of the top tooltip text */
    tooltipTopTextSuffix: PropTypes.string,
    /* The suffix of the bottom tooltip text */
    tooltipBottomTextSuffix: PropTypes.string,
    /* The position of the tooltip */
    tooltipPosition: PropTypes.string,
    /* The show snap lines */
    shouldShowMarkings: PropTypes.bool,
    /* Should snap to the snapping points */
    snap: PropTypes.bool,
    /* The top label */
    topLabel: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
    /* The bottom label */
    bottomLabel: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
    /* Callback when the slider is moved */
    onSliderMove: PropTypes.func,
    /* Callback when the slider is released */
    onSliderRelease: PropTypes.func,
    /* Callback when the slider is granted */
    onSliderGrant: PropTypes.func,
};

const styles = StyleSheet.create({
    tooltipTriangle: {
        borderTopWidth: CONSTANTS.TRIANGLE_SIZE_X,
        borderBottomWidth: CONSTANTS.TRIANGLE_SIZE_X,
        borderLeftWidth: CONSTANTS.TRIANGLE_SIZE_Y,
        borderRightWidth: theme.borderWidth[0],
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: theme.color['secondary-900'],
        borderRightColor: theme.color['secondary-900'],
        position: 'absolute',
    },
    tooltipTransparentText: {
        color: 'transparent',
    },
    toolTipText: {
        color: theme.color['neutral-100'],
        fontSize: theme.fontSize[6.5],
        paddingHorizontal: theme.space[2],
        paddingVertical: theme.space[0.5],
    },
    snapbar: {
        position: 'absolute',
        height: theme.size[0.5],
        backgroundColor: theme.backgroundColor['neutral-700'],
    },
    circle: {
        borderRadius: CONSTANTS.SLIDER_SIZE,
        backgroundColor: theme.backgroundColor['secondary-900'],
        width: CONSTANTS.SLIDER_SIZE,
        height: CONSTANTS.SLIDER_SIZE,
        zIndex: theme.zIndex[3],
    },
    activeCircle: {
        backgroundColor: theme.backgroundColor['secondary-900'],
        position: 'absolute',
        opacity: theme.opacity[50],
        borderRadius: CONSTANTS.SLIDER_SIZE,
        zIndex: theme.zIndex[2],
        width: CONSTANTS.SLIDER_SIZE + theme.space[1.5],
        height: CONSTANTS.SLIDER_SIZE + theme.space[1.5],
        transform: [{ translateX: -3 }, { translateY: -3 }],
    },
    tooltipPlacementLeft: {
        position: 'absolute',
        left: CONSTANTS.SLIDER_SIZE + theme.space[3],
    },
    tooltipPlacementRight: {
        position: 'absolute',
        right: CONSTANTS.SLIDER_SIZE + theme.space[3],
    },
    labelTextWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    labelText: {
        fontSize: theme.fontSize[6.5],
        color: theme.color['neutral-900'],
    },
});


function getSnappingPointsWithinRange(snapPoints, minRange, maxRange, algorithm) {
    const pointSet = new Set();
    const reducedPoints = [];

    for (let i = 0; i < snapPoints.length; i++) {
        // clamp the point to the min and max range
        const clampValue = clampRange(snapPoints[i], minRange, maxRange);

        // check if value in pointSet we don't want to add duplicates
        if (pointSet.has(clampValue)) {
            continue;
        }

        if (clampValue >= minRange && clampValue <= maxRange) {
            pointSet.add(clampValue);
            reducedPoints.push(clampValue);
        }
    }

    // we iterate over the reduced snapPoints array and find its percentage value
    const snappingPercentageArray = reducedPoints.map(point =>
        algorithm.getPosition(point, minRange, maxRange)
    );

    return {
        snappingPoints: reducedPoints,
        snappingPercentageArray,
    };
}

function getTooltipLabels(topValue = 0, bottomValue = 0, tooltipTopTextSuffix = '', tooltipBottomTextSuffix = '', maxRange = 0) {
    topValue = Number(topValue.toFixed(0));
    bottomValue = Number(bottomValue.toFixed(0));

    let tooltipTopLen = tooltipTopTextSuffix.length;
    let tooltipBottomLen = tooltipBottomTextSuffix.length;

    let topSpaceCount = 0;
    let bottomSpaceCount = 0;

    const lenDiff = Math.max(0, Math.abs(tooltipTopLen - tooltipBottomLen));
    if (tooltipTopLen < tooltipBottomLen) {
        topSpaceCount += lenDiff;
    } else {
        bottomSpaceCount += lenDiff;
    }

    const maxRangeLen = maxRange.toString().length;
    const topLenDiff = Math.max(0, maxRangeLen - topValue.toString().length);
    const bottomLenDiff = Math.max(0, maxRangeLen - bottomValue.toString().length);

    topSpaceCount += topLenDiff;
    bottomSpaceCount += bottomLenDiff;

    const topLabelText = `${topValue}${tooltipTopTextSuffix}`;
    const bottomLabelText = `${bottomValue}${tooltipBottomTextSuffix}`;

    return {
        topLabelSpaceCount: topSpaceCount,
        bottomLabelSpacesCount: bottomSpaceCount,
        topLabelText,
        bottomLabelText,
    };
}


function ToolTip({
    text = '',
    spaces = 0,
    sliderSize = 24,
    position = 'left',
}) {
    const dynamicStyles = StyleSheet.create({
        tooltipTop: {
            backgroundColor: theme.backgroundColor['secondary-900'],
            borderRadius: theme.borderRadius[3],
            height: sliderSize,
        },
    });

    const triangleStyle = [
        styles.tooltipTriangle,
        {
            top: sliderSize / 2 - CONSTANTS.TRIANGLE_SIZE_X,
            [position === 'right'
                ? 'left'
                : 'right']: -CONSTANTS.TRIANGLE_SIZE_Y,
            transform: position === 'left' ? [] : [{ rotate: '180deg' }],
        },
    ];

    const isLeft = position === 'left';

    return (
        <Animated.View style={dynamicStyles.tooltipTop}>
            <Text style={styles.toolTipText}>
                {isLeft && (
                    <Text style={styles.tooltipTransparentText}>
                        {'0'.repeat(spaces)}
                    </Text>
                )}
                {text}
                {!isLeft && (
                    <Text style={styles.tooltipTransparentText}>
                        {'0'.repeat(spaces)}
                    </Text>
                )}
            </Text>
            <View style={triangleStyle} />
        </Animated.View>
    );
}

function VerticalRheostat({
    topHandleValue = 0,
    bottomHandleValue = 0,
    minRange = 0,
    maxRange = 1000,
    algorithm = linearAlgorithm,
    rheostatWidth = 200,
    snapPoints = [],
    rheostatHeight = 600,
    tooltipTopTextSuffix = '',
    tooltipBottomTextSuffix = '',
    tooltipPosition = 'left',
    sliderDelta = 20,
    snap = false,
    shouldShowMarkings = false,
    topLabel = React.Fragment,
    bottomLabel = React.Fragment,
    onSliderMove = () => { },
    onSliderRelease = () => { },
    onSliderGrant = () => { },
}) {
    const sliderSize = CONSTANTS.SLIDER_SIZE;
    const rheostatSize = rheostatHeight - sliderSize;
    const animatedOffsetTop = useRef(new Animated.Value(0)).current;
    const animatedOffsetBottom = useRef(new Animated.Value(0)).current;
    const [currentTopValue, setCurrentTopValue] = useState(topHandleValue);
    const [currentBottomValue, setCurrentBottomValue] = useState(bottomHandleValue);
    const [filledBarHeight, setFilledBarHeight] = useState(0);
    const [activeHandle, setActiveHandle] = useState('top');
    const [isDragging, setIsDragging] = useState(false);
    const lastOffsetTop = useRef(0);
    const lastOffsetBottom = useRef(0);

    const { snappingPoints, snappingPercentageArray } = useMemo(() => getSnappingPointsWithinRange(
        snapPoints,
        minRange,
        maxRange,
        algorithm
    ), [algorithm, maxRange, minRange, snapPoints]);

    const getValues = () => {
        const topOffset = animatedOffsetTop.__getValue();
        const bottomOffset = animatedOffsetBottom.__getValue();
        const topFilledPercent = offsetToPercentage(rheostatSize, topOffset);
        const bottomFilledPercent = offsetToPercentage(
            rheostatSize,
            bottomOffset
        );

        let topValue = parseInt(
            maxRange - (topFilledPercent * (maxRange - minRange)) / 100,
            10
        );
        let bottomValue = parseInt(
            minRange + (bottomFilledPercent * (maxRange - minRange)) / 100,
            10
        );
        topValue = Math.min(Math.max(topValue, minRange), maxRange);
        bottomValue = Math.max(Math.min(bottomValue, maxRange), minRange);

        const barFilledPercent = Math.max(
            0,
            100 - (topFilledPercent + bottomFilledPercent)
        );

        return {
            topValue,
            bottomValue,
            topOffset,
            bottomOffset,
            topFilledPercent,
            bottomFilledPercent,
            barFilledPercent,
        };
    };

    // calculate the filled bar height on initial render
    useEffect(() => {
        const { barFilledPercent } = getValues();
        setFilledBarHeight(
            percentToRheostatSize(rheostatSize, barFilledPercent)
        );
    }, []);

    useEffect(() => {
        const percentage = algorithm.getPosition(
            bottomHandleValue,
            minRange,
            maxRange
        );
        const offsetFromTop = (percentage * rheostatSize) / 100;
        animatedOffsetBottom.setValue(-offsetFromTop);
        lastOffsetBottom.current = -offsetFromTop;
        setCurrentBottomValue(bottomHandleValue);

        // re-calculate the filled bar height
        const { barFilledPercent } = getValues();
        setFilledBarHeight(
            percentToRheostatSize(rheostatSize, barFilledPercent)
        );
    }, [bottomHandleValue]);

    useEffect(() => {
        const percentage = algorithm.getPosition(
            topHandleValue,
            minRange,
            maxRange
        );
        const offsetFromTop = rheostatSize - (percentage * rheostatSize) / 100;
        animatedOffsetTop.setValue(offsetFromTop);
        lastOffsetTop.current = offsetFromTop;
        setCurrentTopValue(topHandleValue);

        // re-calculate the filled bar height
        const { barFilledPercent } = getValues();
        setFilledBarHeight(
            percentToRheostatSize(rheostatSize, barFilledPercent)
        );
    }, [topHandleValue]);

    const getClampOffsetTop = offset => {
        const { bottomOffset } = getValues();
        const clampOffset = clampRange(
            offset,
            0,
            rheostatSize + bottomOffset - sliderDelta
        );
        return clampOffset;
    };

    const getClampOffsetBottom = offset => {
        const { topOffset } = getValues();
        const positiveOffset = Math.abs(offset);
        const maxDelta = rheostatSize - topOffset - sliderDelta;
        const clampOffset = clampRange(positiveOffset, 0, maxDelta);
        return clampOffset;
    };

    function onPanGrant(panType, event, gestureState) {
        setActiveHandle(panType);
        const { topOffset, bottomOffset } = getValues();

        // set the last offset based on the pan type
        if (panType === 'top') {
            lastOffsetTop.current = topOffset;
        } else {
            lastOffsetBottom.current = bottomOffset;
        }

        onSliderGrant && onSliderGrant(panType, event, gestureState);
    }

    function onPanMove(panType, event, gestureState) {
        let deltaTop;
        let deltaBottom;
        let clampOffsetTop = 0;
        let clampOffsetBottom = 0;
        const isPanTop = panType === 'top';

        // set the offset based on the pan type (top or bottom) and apply boundary checks
        if (isPanTop) {
            deltaTop = lastOffsetTop.current + gestureState.dy;
            clampOffsetTop = clampRange(deltaTop, 0, rheostatSize);
            animatedOffsetTop.setValue(clampOffsetTop);
        } else {
            deltaBottom = lastOffsetBottom.current + gestureState.dy;
            clampOffsetBottom = clampRange(deltaBottom, -rheostatSize, 0);
            animatedOffsetBottom.setValue(clampOffsetBottom);
        }

        const values = getValues();
        const { topOffset, bottomOffset } = values;


        if (snap) {
            const topHandlePercentage = offsetToPercentage(
                rheostatSize,
                topOffset
            );
            const bottomHandlePercentage = offsetToPercentage(
                rheostatSize,
                -bottomOffset
            );
            const closestBottomIndex = getClosestIndex(
                snappingPercentageArray,
                bottomHandlePercentage
            );
            const closestTopIndex = getClosestIndex(
                snappingPercentageArray,
                100 - topHandlePercentage
            );

            if (isPanTop) {
                const clampIndex = Math.max(
                    closestBottomIndex.index + 1,
                    closestTopIndex.index
                );
                const offset = percentToRheostatSize(
                    rheostatSize,
                    snappingPercentageArray[clampIndex]
                );
                animatedOffsetTop.setValue(rheostatSize - offset);
                const selectedTopValue = snappingPoints[clampIndex];
                setCurrentTopValue(selectedTopValue);
            } else {
                const clampIndex = Math.min(
                    closestTopIndex.index - 1,
                    closestBottomIndex.index
                );
                const offset = percentToRheostatSize(
                    rheostatSize,
                    snappingPercentageArray[clampIndex]
                );
                animatedOffsetBottom.setValue(-offset);
                const selectedBottomValue = snappingPoints[clampIndex];
                setCurrentBottomValue(selectedBottomValue);
            }
        }

        if (!snap) {
            // Handle continuous (non-snapping) movement
            if (isPanTop) {
                const newOffset = offsetToRheostatSize(
                    rheostatSize,
                    getClampOffsetTop(topOffset)
                );
                const percentage = offsetToPercentage(rheostatSize, newOffset);
                // For top handle, we invert the percentage since it moves from top to bottom
                let selectedTopValue =
                    maxRange - (percentage * (maxRange - minRange)) / 100;
                selectedTopValue = Math.min(
                    Math.max(selectedTopValue, minRange),
                    maxRange
                );
                setCurrentTopValue(selectedTopValue);
                animatedOffsetTop.setValue(newOffset);
            } else {
                const newOffset = -offsetToRheostatSize(
                    rheostatSize,
                    getClampOffsetBottom(bottomOffset)
                );
                const percentage = offsetToPercentage(rheostatSize, newOffset);
                let selectedBottomValue =
                    minRange + (percentage * (maxRange - minRange)) / 100;
                selectedBottomValue = Math.max(
                    Math.min(selectedBottomValue, maxRange),
                    minRange
                );
                setCurrentBottomValue(selectedBottomValue);
                animatedOffsetBottom.setValue(newOffset);
            }
        }

        const updatedStateValues = getValues();
        const updateValues = {
            topValue: updatedStateValues.topValue,
            bottomValue: updatedStateValues.bottomValue,
            topOffset: updatedStateValues.topOffset,
            bottomOffset: updatedStateValues.bottomOffset,
        };

        onSliderMove &&
            onSliderMove(panType, updateValues, event, gestureState);

        setFilledBarHeight(
            percentToRheostatSize(
                rheostatSize,
                updatedStateValues.barFilledPercent
            )
        );
        setIsDragging(true);
    }

    function onPanEnd(panType, event, gestureState) {
        if (panType === 'top') {
            const clampOffset = getClampOffsetTop(
                lastOffsetTop.current + gestureState.dy
            );
            lastOffsetTop.current = clampOffset;
        } else {
            const clampOffset = getClampOffsetBottom(
                lastOffsetBottom.current + gestureState.dy
            );
            lastOffsetBottom.current = -clampOffset;
        }

        setIsDragging(false);

        const updatedStateValues = getValues();
        const updateValues = {
            topValue: updatedStateValues.topValue,
            bottomValue: updatedStateValues.bottomValue,
            topOffset: updatedStateValues.topOffset,
            bottomOffset: updatedStateValues.bottomOffset,
        };

        onSliderRelease &&
            onSliderRelease(panType, updateValues, event, gestureState);
    }

    const createPanResponder = (panType = 'top') =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Respond to touch events
            onMoveShouldSetPanResponder: () => true, // Continue responding when moving
            onPanResponderGrant: (event, gestureState) =>
                onPanGrant(panType, event, gestureState),
            onPanResponderMove: (event, gestureState) =>
                onPanMove(panType, event, gestureState),
            onPanResponderRelease: (event, gestureState) =>
                onPanEnd(panType, event, gestureState),
            onPanResponderTerminate: (event, gestureState) =>
                onPanEnd(panType, event, gestureState),
        });

    const panResponderTop = useRef(createPanResponder('top')).current;
    const panResponderBottom = useRef(createPanResponder('bottom')).current;

    const {
        topLabelText,
        bottomLabelText,
        topLabelSpaceCount,
        bottomLabelSpacesCount,
    } = getTooltipLabels(
        currentTopValue,
        currentBottomValue,
        tooltipTopTextSuffix,
        tooltipBottomTextSuffix,
        maxRange
    );

    const dynamicStyles = StyleSheet.create({
        filledBar: {
            width: theme.size[1],
            height: filledBarHeight,
            position: 'absolute',
            left: sliderSize / 2 - theme.space[0.5],
            backgroundColor: theme.backgroundColor['secondary-900'],
            borderRadius: theme.borderRadius[3],
        },
        unFilledBar: {
            width: theme.size[1],
            height: rheostatHeight,
            position: 'absolute',
            left: rheostatWidth / 2 - theme.space[0.5],
            backgroundColor: theme.backgroundColor['neutral-700'],
            borderRadius: theme.borderRadius[3],
        },
        snapBarWrapper: {
            position: 'absolute',
            height: rheostatSize,
            width: rheostatWidth,
            top: sliderSize / 2,
        },
        handleWrapper: {
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'column',
            width: rheostatWidth,
            height: rheostatHeight,
        },
        snapbarPlacementLeft: {
            left:
                rheostatWidth / 2 +
                CONSTANTS.SLIDER_SIZE / 2 +
                theme.space[1.5],
        },
        snapbarPlacementRight: {
            right:
                rheostatWidth / 2 +
                CONSTANTS.SLIDER_SIZE / 2 +
                theme.space[1.5],
        },
    });

    return (
        <View>
            {/* top label */}
            {typeof topLabel === 'string' ? (
                <View style={styles.labelTextWrapper}>
                    <Text style={styles.labelText}>{topLabel}</Text>
                </View>
            ) : React.isValidElement(topLabel) ? (
                topLabel
            ) : null}
            <View>
                <View style={dynamicStyles.unFilledBar} />
                {/* snap markings */}
                <View>
                    {snap && shouldShowMarkings && (
                        <View style={dynamicStyles.snapBarWrapper}>
                            {snappingPercentageArray.map(
                                (percentage, index) => {
                                    // 4dpi is minimum width and 16dpi is maximum width
                                    const width = 4 + (percentage / 100) * 12;
                                    const markPecentage = `${100 -
                                        percentage}%`;

                                    return (
                                        <View
                                            key={`${percentage}-${index}`}
                                            style={[
                                                styles.snapbar,
                                                tooltipPosition === 'right'
                                                    ? dynamicStyles.snapbarPlacementRight
                                                    : dynamicStyles.snapbarPlacementLeft,
                                                {
                                                    width,
                                                    top: markPecentage,
                                                },
                                            ]}
                                        />
                                    );
                                }
                            )}
                        </View>
                    )}
                </View>

                <View style={dynamicStyles.handleWrapper}>
                    {/* Top Pan Handler */}
                    <Animated.View
                        {...panResponderTop.panHandlers}
                        style={[
                            {
                                zIndex: activeHandle === 'top' ? 1 : 0,
                                transform: [
                                    { translateY: animatedOffsetTop || 0 },
                                ],
                            },
                        ]}
                    >
                        <Animated.View
                            renderToHardwareTextureAndroid
                            style={dynamicStyles.filledBar}
                        />
                        <View
                            hitSlop={CONSTANTS.HITSLOP}
                            style={styles.circle}
                        />
                        {isDragging && activeHandle === 'top' && (
                            <View style={styles.activeCircle} />
                        )}

                        <View
                            style={[
                                tooltipPosition === 'right'
                                    ? styles.tooltipPlacementLeft
                                    : styles.tooltipPlacementRight,
                            ]}
                        >
                            <ToolTip
                                sliderSize={sliderSize}
                                position={tooltipPosition}
                                spaces={topLabelSpaceCount}
                                text={topLabelText}
                            />
                        </View>
                    </Animated.View>

                    {/* Bottom Pan Handler */}
                    <Animated.View
                        {...panResponderBottom.panHandlers}
                        style={[
                            {
                                zIndex: activeHandle === 'bottom' ? 1 : 0,
                                transform: [
                                    { translateY: animatedOffsetBottom || 0 },
                                ],
                            },
                        ]}
                    >
                        <View
                            hitSlop={CONSTANTS.HITSLOP}
                            style={styles.circle}
                        />
                        {isDragging && activeHandle === 'bottom' && (
                            <View style={styles.activeCircle} />
                        )}
                        <View
                            style={[
                                tooltipPosition === 'right'
                                    ? styles.tooltipPlacementLeft
                                    : styles.tooltipPlacementRight,
                            ]}
                        >
                            <ToolTip
                                sliderSize={sliderSize}
                                position={tooltipPosition}
                                text={bottomLabelText}
                                spaces={bottomLabelSpacesCount}
                            />
                        </View>
                    </Animated.View>
                </View>
            </View>

            {/* bottom label */}
            {typeof bottomLabel === 'string' ? (
                <View style={styles.labelTextWrapper}>
                    <Text style={styles.labelText}>{bottomLabel}</Text>
                </View>
            ) : React.isValidElement(bottomLabel) ? (
                bottomLabel
            ) : null}
        </View>
    );
}

VerticalRheostat.propTypes = propTypes;

export default VerticalRheostat;