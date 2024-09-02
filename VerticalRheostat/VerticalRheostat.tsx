/* eslint-disable react-native/no-inline-styles */
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
            }}>
            <Text
                style={{
                    color: 'white',
                    fontSize: 16,
                    textAlign: 'center',
                }}
            >{text} {typeof value === 'number' ? value.toFixed(2) : value}</Text>
        </View>
    )
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
        Math.abs(array[left] - target) <
            Math.abs(array[right] - target)
            ? left
            : right;
    return {
        index: closestIndex,
        value: array[closestIndex],
    };
}



export default function App({
    topValue = 0,
    bottomValue = 0,
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
    // Animated.Value to track the current position of the handle
    const animatedOffsetTop = useRef(new Animated.Value(0)).current;
    const animatedOffsetBottom = useRef(new Animated.Value(0)).current;

    const lastOffsetTop = useRef(0);
    const lastOffsetBottom = useRef(0);

    const [currentTopValue, setCurrentTopValue] = useState(topValue);
    const [currentBottomValue, setCurrentBottomValue] = useState(bottomValue);
    const snappingPercentageArray = snappingPoints.map(point => algorithm.getPosition(point, minRange, maxRange));

    const [filledBarPercentage, setFilledPercentageValue] = useState(0);
    // const [filledBarSize, setFilledBarSize] = useState(0);

    useEffect(() => {
        // get value of animatedOffsetTop
        const topOffset = animatedOffsetTop.__getValue();
        const bottomOffset = animatedOffsetBottom.__getValue();


        const topFilled = (topOffset / rheostatSize) * 100;
        const bottomFilled = (-bottomOffset / rheostatSize) * 100;
        setFilledPercentageValue(100 - (topFilled + bottomFilled));
    }, [currentTopValue, currentBottomValue]);


    useEffect(() => {
        const percentage = algorithm.getPosition(bottomValue, minRange, maxRange);
        const offsetFromTop = (percentage * rheostatSize) / 100;
        animatedOffsetBottom.setValue(-offsetFromTop);
        lastOffsetBottom.current = -offsetFromTop;
        setCurrentBottomValue((percentage * maxRange) / 100);
    }, [bottomValue]);

    useEffect(() => {
        const percentage = algorithm.getPosition(topValue, minRange, maxRange);
        const offsetFromTop = (percentage * rheostatSize) / 100;
        animatedOffsetTop.setValue(rheostatSize - offsetFromTop);
        lastOffsetTop.current = rheostatSize - offsetFromTop;
        setCurrentTopValue(maxRange - (percentage * maxRange) / 100);
    }, [topValue]);

    function offsetToPercentage(offset) {
        'worklet';
        return (offset / rheostatSize) * 100;
    }

    function clampWithinRange(value, min, max) {
        'worklet';
        return Math.min(Math.max(value, min), max);
    }

    function percentToRheostatSize(percent) {
        'worklet';
        return (rheostatSize * percent) / 100;
    }

    const createPanResponder = (panType = 'top') => {
        return PanResponder.create({
            onStartShouldSetPanResponder: () => true, // Respond to touch events
            onMoveShouldSetPanResponder: () => true,  // Continue responding when moving

            onPanResponderMove: (event, gestureState) => {

                // handle movement
                if (panType === 'top') {
                    const newOffset = lastOffsetTop.current + gestureState.dy;
                    const clampOffset = clampWithinRange(newOffset, 0, rheostatSize);
                    animatedOffsetTop.setValue(clampOffset);
                } else {
                    const newOffset = lastOffsetBottom.current + gestureState.dy;
                    const clampOffset = clampWithinRange(newOffset, -rheostatSize, 0);
                    animatedOffsetBottom.setValue(clampOffset);
                }

                // get value of animatedOffsetTop
                const topOffset = animatedOffsetTop.__getValue();
                const bottomOffset = animatedOffsetBottom.__getValue();


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
                }


                if (!shouldSnap) {
                    const isOverlapping = topOffset + (-bottomOffset) + handleDelta > rheostatSize;
                    if (panType === 'top') {
                        if (isOverlapping) {
                            animatedOffsetTop.setValue((rheostatSize - (-bottomOffset)) - handleDelta);
                        } else {
                            const newOffset = lastOffsetTop.current + gestureState.dy;
                            const percentageFilled = (newOffset / rheostatSize) * 100;
                            const value = algorithm.getValue(percentageFilled, minRange, maxRange);
                            setCurrentTopValue((maxRange - clampWithinRange(value, minRange, maxRange)));
                        }
                    } else {
                        if (isOverlapping) {
                            animatedOffsetBottom.setValue(-1 * ((rheostatSize - topOffset) - handleDelta));
                        } else {
                            const newOffset = lastOffsetBottom.current + gestureState.dy;
                            const percentageFilled = (newOffset / rheostatSize) * 100;
                            const value = algorithm.getValue(-percentageFilled, minRange, maxRange);
                            setCurrentBottomValue(clampWithinRange(value, minRange, maxRange));
                        }
                    }
                }

            },
            onPanResponderRelease: (event, gestureState) => {
                if (panType === 'top') {
                    lastOffsetTop.current += gestureState.dy;
                } else {
                    lastOffsetBottom.current += gestureState.dy;
                }
            },
        });
    };

    // Create a pan responder to handle gestures
    const panResponderTop = useRef(createPanResponder('top')).current;
    const panResponderBottom = useRef(createPanResponder('bottom')).current;

    const filledBarSize = (filledBarPercentage * rheostatSize) / 100;


    return (
        <View>

            <View style={{
                position: 'absolute',
                height: rheostatHeight - handleSize,
                width: rheostatWidth,
                top: handleSize / 2,
            }}>
                {
                    snappingPercentageArray.map((percentage, index) => {
                        const width = 5 + ((percentage * 15) / 100);
                        return (
                            <View
                                key={index}
                                style={[{
                                    position: 'absolute',
                                    width: width,
                                    height: 2,
                                    backgroundColor: 'white',
                                    top: `${100 - percentage}%`,

                                },
                                tooltipPosition === 'left' ? {
                                    left: (handleSize / 2) + 8,
                                } : {
                                    right: (handleSize / 2) + 8,
                                }]}
                            />
                        );
                    })
                }
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
                        style={{
                            width: 4,
                            position: 'absolute',
                            // top: (snappingPercentageArray[0] * rheostatSize) / 100,
                            height: `${filledBarPercentage}%`,
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
                            backgroundColor: 'red',
                        },
                        {
                            transform: [{ translateY: animatedOffsetBottom || 0 }], // Correctly apply transform
                        },
                    ]}
                />
            </View>
            <LabelText text="top" value={currentTopValue} />
            <LabelText text="bot" value={currentBottomValue} />

        </View>
    );
}

const styles = StyleSheet.create({
    circle: {
        borderRadius: 500,
        backgroundColor: '#00857a',
    },
});
