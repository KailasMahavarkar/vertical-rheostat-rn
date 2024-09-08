import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Animated, PanResponder } from 'react-native';
import { linearAlgorithm } from './algorithm';

function jslog(...args) {
    console.log(JSON.stringify(args, null, 2));
}

function LabelText({ value, text }) {
    return (
        <View
            style={{
                borderWidth: 1,
                borderColor: 'red',
                width: 200,
            }}
        >
            <Text
                style={{
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'center',
                }}
            >
                {text} {typeof value === 'number' ? value.toFixed(2) : value}
            </Text>
        </View>
    );
}

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
    circle: {
        borderRadius: 500,
        backgroundColor: '#00857a',
    },
});

function VerticalRheostat({
    topHandleValue = 0,
    bottomHandleValue = 0,
    minRange = 0,
    maxRange = 800,
    handleSize = 50,
    algorithm = linearAlgorithm,
    rheostatWidth = 200,
    snappingPoints = [],
    rheostatHeight = 600,
    tooltipPosition = 'left',

    handleDelta = 20,
    shouldSnap = false,
}) {
    const rheostatSize = rheostatHeight - handleSize;
    const animatedOffsetTop = useRef(new Animated.Value(0)).current;
    const animatedOffsetBottom = useRef(new Animated.Value(0)).current;

    const lastOffsetTop = useRef(0);
    const lastOffsetBottom = useRef(0);

    const [currentTopValue, setCurrentTopValue] = useState(topHandleValue);
    const [currentBottomValue, setCurrentBottomValue] = useState(bottomHandleValue);
    const snappingPercentageArray = snappingPoints.map(point =>
        algorithm.getPosition(point, minRange, maxRange)
    );
    const [filledBarHeight, setFilledBarHeight] = useState(0);

    // Convert the offset(distance) to a percentage
    const offsetToPercentage = offset =>
        (Math.abs(offset) / rheostatSize) * 100;

    // Convert the percentage to a rheostat size
    const percentToRheostatSize = percent =>
        Math.max(0, (rheostatSize * percent) / 100);

    // Clamp the value between the min and max
    const clampRange = (value, min, max) => Math.min(Math.max(value, min), max);

    // Convert the offset to a rheostat size
    const offsetToRheostatSize = offset => {
        return percentToRheostatSize(offsetToPercentage(offset));
    }

    function getValues() {
        const topOffset = animatedOffsetTop.__getValue();
        const bottomOffset = animatedOffsetBottom.__getValue();
        const topFilledPercent = offsetToPercentage(topOffset);
        const bottomFilledPercent = offsetToPercentage(bottomOffset);
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
    }

    function getClampOffsetTop(offset) {
        const { bottomOffset } = getValues();
        const clampOffset = clampRange(offset, 0, rheostatSize + bottomOffset - handleDelta);
        return clampOffset;
    }

    function getClampOffsetBottom(offset) {
        const { topOffset } = getValues();
        const positiveOffset = Math.abs(offset);
        const maxDelta = rheostatSize - topOffset - handleDelta;
        const clampOffset = clampRange(positiveOffset, 0, maxDelta);
        return clampOffset;
    }

    function onPanEnd(panType, gestureState) {
        if (panType === 'top') {
            const clampOffset = getClampOffsetTop(lastOffsetTop.current + gestureState.dy);
            lastOffsetTop.current = clampOffset;
        } else {
            const clampOffset = getClampOffsetBottom(lastOffsetBottom.current + gestureState.dy);
            lastOffsetBottom.current = -clampOffset;
        }
    }

    useEffect(() => {
        const percentage = algorithm.getPosition(
            bottomHandleValue,
            minRange,
            maxRange
        );
        const offsetFromTop = (percentage * rheostatSize) / 100;
        animatedOffsetBottom.setValue(-offsetFromTop);
        lastOffsetBottom.current = -offsetFromTop;
        setCurrentBottomValue((percentage * maxRange) / 100);

        // re-calculate the filled bar height
        const { barFilledPercent } = getValues();
        setFilledBarHeight(percentToRheostatSize(barFilledPercent));

    }, [bottomHandleValue]);

    useEffect(() => {
        const percentage = algorithm.getPosition(topHandleValue, minRange, maxRange);
        const offsetFromTop = (percentage * rheostatSize) / 100;
        animatedOffsetTop.setValue(rheostatSize - offsetFromTop);
        lastOffsetTop.current = rheostatSize - offsetFromTop;
        setCurrentTopValue(maxRange - (percentage * maxRange) / 100);

        // re-calculate the filled bar height
        const { barFilledPercent } = getValues();
        setFilledBarHeight(percentToRheostatSize(barFilledPercent));
    }, [topHandleValue]);

    useEffect(() => {
        const { barFilledPercent } = getValues();
        setFilledBarHeight(percentToRheostatSize(barFilledPercent));
    }, [])


    const createPanResponder = (panType = 'top') =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Respond to touch events
            onMoveShouldSetPanResponder: () => true, // Continue responding when moving
            onPanResponderMove: (event, gestureState) => {
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
                    const topHandlePercentage = offsetToPercentage(topOffset);
                    const bottomHandlePercentage = offsetToPercentage(-bottomOffset);
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
                        const offset = percentToRheostatSize(snappingPercentageArray[clampIndex]);
                        animatedOffsetTop.setValue(rheostatSize - offset);
                        setCurrentTopValue(snappingPoints[clampIndex]);
                    } else {
                        const clampIndex = Math.min(closestTopIndex.index - 1, closestBottomIndex.index);
                        const offset = percentToRheostatSize(snappingPercentageArray[clampIndex]);
                        animatedOffsetBottom.setValue(-1 * offset);
                        setCurrentBottomValue(snappingPoints[clampIndex]);
                    }
                } else {
                    // clmap the offset to handle overlapping (top should not overlap bottom and vice versa)
                    if (panType === 'top') {
                        const newOffset = offsetToRheostatSize(getClampOffsetTop(topOffset));
                        const percentage = offsetToPercentage(newOffset);
                        const value = maxRange - (percentage * maxRange) / 100;
                        setCurrentTopValue(value);
                        animatedOffsetTop.setValue(newOffset);
                    } else {
                        const newOffset = -offsetToRheostatSize(getClampOffsetBottom(bottomOffset));
                        const percentage = offsetToPercentage(newOffset);
                        const value = (percentage * maxRange) / 100;
                        setCurrentBottomValue(value);
                        animatedOffsetBottom.setValue(newOffset);
                    }
                }
                const { barFilledPercent } = getValues();
                setFilledBarHeight(percentToRheostatSize(barFilledPercent));
            },
            onPanResponderRelease: (event, gestureState) => {
                onPanEnd(panType, gestureState);
            },
            onPanResponderTerminate: (event, gestureState) => {
                onPanEnd(panType, gestureState);
            },
        });

    // Create a pan responder to handle gestures
    const panResponderTop = useRef(createPanResponder('top')).current;
    const panResponderBottom = useRef(createPanResponder('bottom')).current;

    return (
        <View>
            <View
                style={{
                    position: 'absolute',
                    height: rheostatHeight - handleSize,
                    width: rheostatWidth,
                    top: handleSize / 2,
                }}
            >
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
                                    top: `${100 - percentage}%`,
                                },
                                tooltipPosition === 'left'
                                    ? {
                                        left: handleSize / 2 + 8,
                                    }
                                    : {
                                        right: handleSize / 2 + 8,
                                    },
                            ]}
                        />
                    );
                })}
            </View>

            <View
                style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexDirection: 'column',
                    width: 200,
                    height: 600,
                    marginBottom: 100,
                    borderWidth: 1,
                    borderColor: 'red',
                }}
            >
                <Animated.View
                    {...panResponderTop.panHandlers} // Attach pan handlers to the animated view
                    style={[
                        {
                            width: handleSize,
                            height: handleSize,
                        },
                        styles.circle,
                        {
                            transform: [{ translateY: animatedOffsetTop || 0 }], // Correctly apply transform
                        },
                    ]}
                >
                    <Animated.View
                        renderToHardwareTextureAndroid
                        style={{
                            width: 4,
                            height: filledBarHeight,
                            position: 'absolute',
                            left: handleSize / 2 - 2,
                            backgroundColor: '#00857a',
                            borderRadius: 3,
                        }}
                    />
                </Animated.View>

                <Animated.View
                    {...panResponderBottom.panHandlers} // Attach pan handlers to the animated view
                    style={[
                        {
                            width: handleSize,
                            height: handleSize,
                        },
                        styles.circle,
                      
                        {
                            transform: [
                                { translateY: animatedOffsetBottom || 0 },
                            ], // Correctly apply transform
                        },
                    ]}
                />
            </View>
            <LabelText text="top" value={currentTopValue} />
            <LabelText text="bot" value={currentBottomValue} />
        </View>
    );
}

export default VerticalRheostat;
