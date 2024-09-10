import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, PanResponder } from 'react-native';
import { linearAlgorithm } from './algorithm';
import { jslog, clampRange, offsetToPercentage, percentToRheostatSize, offsetToRheostatSize } from './utils';
import propTypes from 'prop-types';

const CONSTANTS = {
    TRIANGLE_SIZE_X: 6,
    TRIANGLE_SIZE_Y: 8,
};

const PropTypes = {
    topHandleValue: propTypes.number,
    bottomHandleValue: propTypes.number,
    minRange: propTypes.number,
    maxRange: propTypes.number,
    handleSize: propTypes.number,
    algorithm: propTypes.object,
    rheostatWidth: propTypes.number,
    snappingPoints: propTypes.array,
    rheostatHeight: propTypes.number,
    tooltipTextSuffix: propTypes.string,
    tooltipPosition: propTypes.string,
    showSnapLines: propTypes.bool,
    handleDelta: propTypes.number,
    shouldSnap: propTypes.bool,
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


function ToolTip({ value, handleSize, position, suffix, diff }) {
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
                    position === 'left' && (
                        <Text style={styles.tooltipTransparentText}>
                            {'0'.repeat(diff)}
                        </Text>
                    )
                }
                {`${Math.round(value)} ${suffix}`}
                {
                    position === 'right' && (
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
    tooltipTextSuffix = '',
    tooltipPosition = 'left',
    showSnapLines = false,
    handleDelta = 20,
    shouldSnap = false,
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

    function onPanMove(panType, event, gestureState) {
        let deltaTop;
        let deltaBottom;
        let clampOffsetTop;
        let clampOffsetBottom;

        // set the offset based on the pan type (top or bottom) and apply boundary checks
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
            const topHandlePercentage = offsetToPercentage(rheostatSize, topOffset);
            const bottomHandlePercentage = offsetToPercentage(rheostatSize, -bottomOffset);
            const closestBottomIndex = getClosestIndex(
                snappingPercentageArray,
                bottomHandlePercentage,
            );

            const closestTopIndex = getClosestIndex(
                snappingPercentageArray,
                100 - topHandlePercentage,
            );
            if (panType === 'top') {
                const clampIndex = Math.max(closestBottomIndex.index + 1, closestTopIndex.index);
                const offset = percentToRheostatSize(rheostatSize, snappingPercentageArray[clampIndex]);
                animatedOffsetTop.setValue(rheostatSize - offset);
                setCurrentTopValue(snappingPoints[clampIndex]);
            } else {
                const clampIndex = Math.min(closestTopIndex.index - 1, closestBottomIndex.index);
                const offset = percentToRheostatSize(rheostatSize, snappingPercentageArray[clampIndex]);
                animatedOffsetBottom.setValue(-1 * offset);
                setCurrentBottomValue(snappingPoints[clampIndex]);
            }
        } else {
            // clmap the offset to handle overlapping (top should not overlap bottom and vice versa)
            if (panType === 'top') {
                const newOffset = offsetToRheostatSize(rheostatSize, getClampOffsetTop(topOffset));
                const percentage = offsetToPercentage(rheostatSize, newOffset);
                const value = maxRange - (percentage * maxRange) / 100;
                setCurrentTopValue(value);
                animatedOffsetTop.setValue(newOffset);
            } else {
                const newOffset = -offsetToRheostatSize(rheostatSize, getClampOffsetBottom(bottomOffset));
                const percentage = offsetToPercentage(rheostatSize, newOffset);
                const value = (percentage * maxRange) / 100;
                setCurrentBottomValue(value);
                animatedOffsetBottom.setValue(newOffset);
            }
        }
        const { barFilledPercent } = getValues();
        setFilledBarHeight(percentToRheostatSize(rheostatSize, barFilledPercent));
    }

    function onPanEnd(panType, event, gestureState) {
        if (panType === 'top') {
            const clampOffset = getClampOffsetTop(lastOffsetTop.current + gestureState.dy);
            lastOffsetTop.current = clampOffset;
        } else {
            const clampOffset = getClampOffsetBottom(lastOffsetBottom.current + gestureState.dy);
            lastOffsetBottom.current = -clampOffset;
        }
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
    }, [bottomHandleValue]);

    useEffect(() => {
        const percentage = algorithm.getPosition(topHandleValue, minRange, maxRange);
        const offsetFromTop = rheostatSize - ((percentage * rheostatSize) / 100);
        animatedOffsetTop.setValue(offsetFromTop);
        lastOffsetTop.current = offsetFromTop;
        setCurrentTopValue(topHandleValue);

        // // re-calculate the filled bar height
        const { barFilledPercent } = getValues();
        setFilledBarHeight(percentToRheostatSize(rheostatSize, barFilledPercent));
    }, [topHandleValue]);


    const createPanResponder = (panType = 'top') =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Respond to touch events
            onMoveShouldSetPanResponder: () => true, // Continue responding when moving
            onPanResponderMove: (event, gestureState) => onPanMove(panType, event, gestureState),
            onPanResponderRelease: (event, gestureState) => onPanEnd(panType, event, gestureState),
            onPanResponderTerminate: (event, gestureState) => onPanEnd(panType, event, gestureState),
        });

    const panResponderTop = useRef(createPanResponder('top')).current;
    const panResponderBottom = useRef(createPanResponder('bottom')).current;
    const maxWidthLength = maxRange.toString().length;
    const topValueDiff = maxWidthLength - currentTopValue.toString().length;
    const bottomValueDiff = maxWidthLength - currentBottomValue.toString().length;


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
        },
    });

    return (
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
                            suffix={tooltipTextSuffix}
                            diff={topValueDiff}
                        />
                    </View>
                </Animated.View>



                <Animated.View
                    {...panResponderBottom.panHandlers}
                    style={[
                        {
                            transform: [
                                { translateY: animatedOffsetBottom || 0 },
                            ],
                        },
                    ]}
                >
                    <View style={dynamicStyles.circle} />

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
                            suffix={tooltipTextSuffix}
                            diff={bottomValueDiff}
                        />
                    </View>
                </Animated.View>

            </View>
        </View >

    );
}

VerticalRheostat.propTypes = PropTypes;

export default VerticalRheostat;
