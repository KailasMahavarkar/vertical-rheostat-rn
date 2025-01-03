import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, PanResponder } from 'react-native';
import { linearAlgorithm } from './algorithm';
import { clampRange, offsetToPercentage, percentToRheostatSize, offsetToRheostatSize } from './utils';
import propTypes from 'prop-types';

const CONSTANTS = {
    TRIANGLE_SIZE_X: 6,
    TRIANGLE_SIZE_Y: 8,
};

const PropTypes = {
    /* The value of the top handle */
    topHandleValue: propTypes.number,
    /* The value of the bottom handle */
    bottomHandleValue: propTypes.number,
    /* The minimum range value */
    minRange: propTypes.number.isRequired,
    /* The maximum range value */
    maxRange: propTypes.number.isRequired,
    /* The size of the handle(circle) */
    handleSize: propTypes.number,
    /* when delta is 0 both handle overlap completely, when delta equals handleSize both handle will never overlap(in terms of UI)  */
    handleDelta: propTypes.number,
    /* The algorithm to be used */
    algorithm: propTypes.object,
    /* The width of the rheostat */
    rheostatWidth: propTypes.number.isRequired,
    /* The height of the rheostat */
    rheostatHeight: propTypes.number,
    /* The snapping points (should be valid number between minRange and maxRange inclusive) */
    snappingPoints: propTypes.array,
    /* The suffix of the tooltip text */
    tooltipTextSuffix: propTypes.string,
    /* The position of the tooltip */
    tooltipPosition: propTypes.string,
    /* The float precision of the tooltip */
    tooltipFloatPrecision: propTypes.number,
    /* The show snap lines */
    showSnapLines: propTypes.bool,
    /* Should snap to the snapping points */
    shouldSnap: propTypes.bool,
    /* The top label */
    topLabel: propTypes.node,
    /* The bottom label */
    bottomLabel: propTypes.node,
};


function getClosestIndex(array, target) {
    let left = 0;
    let right = array.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (array[mid] === target) {
            return {
                index: mid,
                value: array[mid],
            };
        }
        if (array[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // If the target is not found, find the closest index
    const closestIndex =
        Math.abs(array[left] - target) < Math.abs(array[right] - target)
            ? left
            : right;
    return {
        index: closestIndex,
        value: array[closestIndex],
    };
}

const styles = StyleSheet.create({
    tooltipTriangle: {
        borderTopWidth: CONSTANTS.TRIANGLE_SIZE_X,
        borderBottomWidth: CONSTANTS.TRIANGLE_SIZE_X,
        borderLeftWidth: CONSTANTS.TRIANGLE_SIZE_Y,
        borderRightWidth: 0,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#00857a',
        borderRightColor: '#00857a',
        position: 'absolute',
    },
    tooltipTransparentText: {
        color: 'transparent',
    },
    toolTipText: {
        color: 'white',
        fontSize: 13,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
})


function ToolTip({
    value = 0,
    handleSize = 24,
    position = 'left',
    suffix = '',
    diff = 0,
    floatPrecision = 0,
}) {
    const dynamicStyles = StyleSheet.create({
        tooltipTop: {
            backgroundColor: '#00857a',
            borderRadius: 3,
            height: handleSize,
        },
    });

    const triangleStyle = [
        styles.tooltipTriangle,
        {
            top: handleSize / 2 - CONSTANTS.TRIANGLE_SIZE_X,
            [position === 'right' ? 'left' : 'right']: -CONSTANTS.TRIANGLE_SIZE_Y,
            transform: position === 'left' ? [] : [{ rotate: '180deg' }],
        },
    ];

    return (
        <Animated.View style={dynamicStyles.tooltipTop}>
            <Text style={styles.toolTipText}>
                {
                    position === 'left' && diff > 0 && (
                        <Text style={styles.tooltipTransparentText}>
                            {'0'.repeat(diff)}
                        </Text>
                    )
                }
                {`${Number(value.toString()).toFixed(floatPrecision)} ${suffix}`}
                {
                    position === 'right' && diff > 0 && (
                        <Text style={styles.tooltipTransparentText}>
                            {'0'.repeat(diff)}
                        </Text>
                    )
                }
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
    handleSize = 50,
    algorithm = linearAlgorithm,
    rheostatWidth = 200,
    snappingPoints = [],
    rheostatHeight = 600,
    tooltipTopTextSuffix = '',
    tooltipBottomTextSuffix = '',
    tooltipPosition = 'left',
    showSnapLines = false,
    handleDelta = 20,
    shouldSnap = false,
    topLabel = React.Fragment,
    bottomLabel = React.Fragment,
    tooltipFloatPrecision = 0,
}) {
    const rheostatSize = rheostatHeight - handleSize;
    const animatedOffsetTop = useRef(new Animated.Value(0)).current;
    const animatedOffsetBottom = useRef(new Animated.Value(0)).current;
    const [currentTopValue, setCurrentTopValue] = useState(topHandleValue);
    const [currentBottomValue, setCurrentBottomValue] = useState(bottomHandleValue);
    const lastOffsetTop = useRef(0);
    const lastOffsetBottom = useRef(0);
    const snappingPercentageArray = snappingPoints.map(point =>
        algorithm.getPosition(point, minRange, maxRange)
    );
    const [filledBarHeight, setFilledBarHeight] = useState(0);
    const [activeHandle, setActiveHandle] = useState('top');
    const [isDragging, setIsDragging] = useState(false);

    const getValues = useCallback(() => {
        const topOffset = animatedOffsetTop.__getValue();
        const bottomOffset = animatedOffsetBottom.__getValue();
        const topFilledPercent = offsetToPercentage(rheostatSize, topOffset);
        const bottomFilledPercent = offsetToPercentage(rheostatSize, bottomOffset);
        const topValue =
            maxRange - (topFilledPercent * maxRange) / 100;
        const bottomValue = (bottomFilledPercent * maxRange) / 100;
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
    }, [animatedOffsetTop, animatedOffsetBottom, rheostatSize, maxRange]);

    const getClampOffsetTop = useCallback((offset) => {
        const { bottomOffset } = getValues();
        const clampOffset = clampRange(offset, 0, rheostatSize + bottomOffset - handleDelta);
        return clampOffset;
    }, [getValues, handleDelta, rheostatSize]);

    const getClampOffsetBottom = useCallback((offset) => {
        const { topOffset } = getValues();
        const positiveOffset = Math.abs(offset);
        const maxDelta = rheostatSize - topOffset - handleDelta;
        const clampOffset = clampRange(positiveOffset, 0, maxDelta);
        return clampOffset;
    }, [getValues, handleDelta, rheostatSize]);

    function onPanGrant(panType, event, gestureState) {
        setActiveHandle(panType);

        const { topOffset, bottomOffset } = getValues();

        // set the last offset based on the pan type
        if (panType === 'top') {
            lastOffsetTop.current = topOffset;
        } else {
            lastOffsetBottom.current = bottomOffset;
        }
    }

    function onPanMove(panType, event, gestureState) {
        let deltaTop;
        let deltaBottom;
        let clampOffsetTop;
        let clampOffsetBottom;

        // Handle either top or bottom pan gesture
        if (panType === 'top') {
            deltaTop = lastOffsetTop.current + gestureState.dy;
            clampOffsetTop = clampRange(deltaTop, 0, rheostatSize);
            animatedOffsetTop.setValue(clampOffsetTop);
        } else {
            deltaBottom = lastOffsetBottom.current + gestureState.dy;
            clampOffsetBottom = clampRange(
                deltaBottom,
                -rheostatSize,
                0
            );
            animatedOffsetBottom.setValue(clampOffsetBottom);
        }

        const { topOffset, bottomOffset } = getValues();

        if (shouldSnap) {
            // Calculate percentages for both handles
            const topHandlePercentage = offsetToPercentage(rheostatSize, topOffset);
            const bottomHandlePercentage = offsetToPercentage(rheostatSize, -bottomOffset);

            // Find closest snapping points
            const closestBottomIndex = getClosestIndex(
                snappingPercentageArray,
                bottomHandlePercentage,
            );
            const closestTopIndex = getClosestIndex(
                snappingPercentageArray,
                100 - topHandlePercentage,
            );

            if (panType === 'top') {
                // Ensure top handle doesn't go below bottom handle
                const clampIndex = Math.max(closestBottomIndex.index + 1, closestTopIndex.index);
                const offset = percentToRheostatSize(rheostatSize, snappingPercentageArray[clampIndex]);
                animatedOffsetTop.setValue(rheostatSize - offset);
                setCurrentTopValue(snappingPoints[clampIndex]);
            } else {
                // Ensure bottom handle doesn't go above top handle
                const clampIndex = Math.min(closestTopIndex.index - 1, closestBottomIndex.index);
                const offset = percentToRheostatSize(rheostatSize, snappingPercentageArray[clampIndex]);
                animatedOffsetBottom.setValue(-offset);
                setCurrentBottomValue(snappingPoints[clampIndex]);
            }
        } else {
            // Handle continuous (non-snapping) movement
            if (panType === 'top') {
                const newOffset = offsetToRheostatSize(rheostatSize, getClampOffsetTop(topOffset));
                const percentage = offsetToPercentage(rheostatSize, newOffset);
                // For top handle, we invert the percentage since it moves from top to bottom
                const value = maxRange - (percentage * (maxRange - minRange)) / 100;
                setCurrentTopValue(Math.min(Math.max(value, minRange), maxRange));
                animatedOffsetTop.setValue(newOffset);
            } else {
                const newOffset = -offsetToRheostatSize(rheostatSize, getClampOffsetBottom(bottomOffset));
                const percentage = offsetToPercentage(rheostatSize, newOffset);
                const value = minRange + (percentage * (maxRange - minRange)) / 100;
                setCurrentBottomValue(Math.max(Math.min(value, maxRange), minRange));
                animatedOffsetBottom.setValue(newOffset);
            }
        }

        // Update the filled bar size
        const { barFilledPercent } = getValues();
        setFilledBarHeight(percentToRheostatSize(rheostatSize, barFilledPercent));
        setIsDragging(true);
    }

    function onPanEnd(panType, event, gestureState) {
        if (panType === 'top') {
            const clampOffset = getClampOffsetTop(lastOffsetTop.current + gestureState.dy);
            lastOffsetTop.current = clampOffset;
        } else {
            const clampOffset = getClampOffsetBottom(lastOffsetBottom.current + gestureState.dy);
            lastOffsetBottom.current = -clampOffset;
        }

        setIsDragging(false);
    }

    // calculate the filled bar height on initial render
    useEffect(() => {
        const { barFilledPercent } = getValues();
        setFilledBarHeight(percentToRheostatSize(rheostatSize, barFilledPercent));
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
        setFilledBarHeight(percentToRheostatSize(rheostatSize, barFilledPercent));
    }, [algorithm, animatedOffsetBottom, bottomHandleValue, getValues, maxRange, minRange, rheostatSize]);

    useEffect(() => {
        const percentage = algorithm.getPosition(topHandleValue, minRange, maxRange);
        const offsetFromTop = rheostatSize - ((percentage * rheostatSize) / 100);
        animatedOffsetTop.setValue(offsetFromTop);
        lastOffsetTop.current = offsetFromTop;
        setCurrentTopValue(topHandleValue);

        // re-calculate the filled bar height
        const { barFilledPercent } = getValues();
        setFilledBarHeight(percentToRheostatSize(rheostatSize, barFilledPercent));
    }, [topHandleValue]);


    const createPanResponder = (panType = 'top') =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Respond to touch events
            onMoveShouldSetPanResponder: () => true, // Continue responding when moving
            onPanResponderGrant: (event, gestureState) => onPanGrant(panType, event, gestureState),
            onPanResponderMove: (event, gestureState) => onPanMove(panType, event, gestureState),
            onPanResponderRelease: (event, gestureState) => onPanEnd(panType, event, gestureState),
            onPanResponderTerminate: (event, gestureState) => onPanEnd(panType, event, gestureState),
        });

    const panResponderTop = useRef(createPanResponder('top')).current;
    const panResponderBottom = useRef(createPanResponder('bottom')).current;
    const maxWidthLength = maxRange.toString().length;
    const topValueDiff = maxWidthLength - parseInt(currentTopValue.toString(), 10).toString().length;
    const bottomValueDiff = maxWidthLength - parseInt(currentBottomValue.toString(), 10).toString().length;


    const dynamicStyles = StyleSheet.create({
        filledBar: {
            width: 4,
            height: filledBarHeight,
            position: 'absolute',
            left: handleSize / 2 - 2,
            backgroundColor: '#00857a',
            borderRadius: 3,
        },
        unFilledBar: {
            width: 4,
            height: rheostatSize,
            top: handleSize / 2,
            position: 'absolute',
            left: rheostatWidth / 2 - 2,
            backgroundColor: '#d5d5d5',
            borderRadius: 3,
        },
        snapBarWrapper: {
            position: 'absolute',
            height: rheostatSize,
            borderWidth: 1,
            width: rheostatWidth,
            top: handleSize / 2,
        },
        handleWrapper: {
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'column',
            width: rheostatWidth,
            height: rheostatHeight,
            borderWidth: 1,
            borderColor: 'red',
        },
        circle: {
            borderRadius: 500,
            backgroundColor: '#00857a',
            width: handleSize,
            height: handleSize,
            zIndex: 3,
        },

        activeCircle: {
            backgroundColor: 'red',
            position: 'absolute',
            opacity: 0.7,
            zIndex: 2,
            borderRadius: 500,
            width: handleSize + 4,
            height: handleSize + 4,
            transform: [
                { translateX: -2 },
                { translateY: -2 }
            ],
        }
    });

    return (
        <View>
            {topLabel && topLabel}
            <View>
                <View style={dynamicStyles.unFilledBar} />
                <View>
                    {shouldSnap && showSnapLines && (
                        <View style={dynamicStyles.snapBarWrapper}>
                            {snappingPercentageArray.map((percentage, index) => {
                                const width = 5 + (percentage * 15) / 100;
                                return (
                                    <View
                                        key={index}
                                        style={[
                                            {
                                                position: 'absolute',
                                                width: width,
                                                height: 2,
                                                backgroundColor: 'white',
                                            },
                                            tooltipPosition === 'right'
                                                ? {
                                                    left: handleSize / 2 + 8,
                                                    top: `${100 - percentage}%`,
                                                }
                                                : {
                                                    right: handleSize / 2 + 8,
                                                    top: `${100 - percentage}%`,
                                                },
                                        ]}
                                    />
                                );
                            })}
                        </View>
                    )}
                </View>

                <View style={dynamicStyles.handleWrapper}>
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

                        <View style={dynamicStyles.circle} />
                        {
                            isDragging && activeHandle === 'top' && (
                                <View style={dynamicStyles.activeCircle} />
                            )
                        }

                        <View
                            style={[
                                tooltipPosition === 'right' ? {
                                    position: 'absolute',
                                    left: handleSize + 16,
                                } : {
                                    position: 'absolute',
                                    right: handleSize + 16,
                                }
                            ]}>

                            <ToolTip
                                value={currentTopValue}
                                handleSize={handleSize}
                                position={tooltipPosition}
                                suffix={tooltipTopTextSuffix}
                                diff={topValueDiff}
                                floatPrecision={tooltipFloatPrecision}
                            />
                        </View>
                    </Animated.View>



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

                        <View style={dynamicStyles.circle} />
                        {
                            isDragging && activeHandle === 'bottom' && (
                                <View style={dynamicStyles.activeCircle} />
                            )
                        }


                        <View
                            style={[
                                tooltipPosition === 'right' ? {
                                    position: 'absolute',
                                    left: handleSize + 16,
                                } : {
                                    position: 'absolute',
                                    right: handleSize + 16,
                                }
                            ]}>

                            <ToolTip
                                value={currentBottomValue}
                                handleSize={handleSize}
                                position={tooltipPosition}
                                suffix={tooltipBottomTextSuffix}
                                diff={bottomValueDiff}
                                floatPrecision={tooltipFloatPrecision}
                            />
                        </View>
                    </Animated.View>

                </View>
            </View >
            {bottomLabel && bottomLabel}
        </View>

    );
}

VerticalRheostat.propTypes = PropTypes;

export default VerticalRheostat;
