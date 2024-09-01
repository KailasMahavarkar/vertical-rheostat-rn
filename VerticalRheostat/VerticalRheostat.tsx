/* eslint-disable react-native/no-inline-styles */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { linearAlgorithm, log10Algorithm } from './algorithm';

const CONSTANTS = {
  TRIANGLE_SIZE_X: 6,
  TRIANGLE_SIZE_Y: 8,
};


const jslog = (...args) => {
  'worklet';
  console.log(JSON.stringify(args, null, 2));
};

export default function App({
  shouldSnap = false,
  handleDelta = 0,
  snappingPoints = [],
  minRange = 0,
  maxRange = 800,
  handleSize = 50,
  rheostatWidth = 200,
  rheostatHeight = 600,

  tooltipPosition = 'left',

  topLabel = '',
  bottomLabel = '',

  suffix = '',

  topValue = 50,
  bottomValue = 50,
  algorithm = linearAlgorithm,
}) {
  const rheostatSize = rheostatHeight - handleSize;

  const animatedOffsetTop = useSharedValue<number>(0);
  const animatedLastOffsetTop = useSharedValue<number>(0);
  const animatedOffsetBottom = useSharedValue<number>(0);
  const animatedLastOffsetBottom = useSharedValue<number>(0);
  const [currentPositionTop, setCurrentPositionTop] = useState<number>(maxRange);
  const [currentPositionBottom, setCurrentPositionBottom] = useState<number>(0);

  const snappingPercentageArray = snappingPoints.map(point => algorithm.getPosition(point, minRange, maxRange));
  const lastInteractedPan = useSharedValue<string>('top');

  const filledBarPercentage = useDerivedValue(() => {
    const topFilled = (animatedOffsetTop.value / rheostatSize) * 100;
    const bottomFilled = (-animatedOffsetBottom.value / rheostatSize) * 100;
    return 100 - (topFilled + bottomFilled);
  }, [animatedOffsetTop.value, animatedOffsetBottom.value]);

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

  useEffect(() => {
    const percentage = algorithm.getPosition(bottomValue, minRange, maxRange);
    const offsetFromTop = (percentage * rheostatSize) / 100;
    animatedOffsetBottom.value = -offsetFromTop;
    animatedLastOffsetBottom.value = -offsetFromTop;

    setCurrentPositionBottom((percentage * maxRange) / 100);
  }, [bottomValue]);


  useEffect(() => {
    const percentage = algorithm.getPosition(topValue, minRange, maxRange);
    const offsetFromTop = (percentage * rheostatSize) / 100;
    animatedOffsetTop.value = rheostatSize - offsetFromTop;
    animatedLastOffsetTop.value = rheostatSize - offsetFromTop;

    setCurrentPositionTop(maxRange - (percentage * maxRange) / 100);
  }, [topValue]);

  const getPan = (panType) => Gesture.Pan()
    .onBegin(() => { })
    .onChange((event) => {
      lastInteractedPan.value = panType;

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

      // handle movement
      if (panType === 'top') {
        const newOffset = event.translationY + animatedLastOffsetTop.value;
        const clampOffset = clampWithinRange(newOffset, 0, rheostatSize);
        animatedOffsetTop.value = clampOffset;
      } else {
        const newOffset = event.translationY + animatedLastOffsetBottom.value;
        const clampOffset = clampWithinRange(newOffset, -rheostatSize, 0);
        animatedOffsetBottom.value = clampOffset;
      }

      if (shouldSnap) {
        const topHandlePercentage = offsetToPercentage(animatedOffsetTop.value);
        const bottomHandlePercentage = offsetToPercentage(-animatedOffsetBottom.value);
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
          runOnJS(setCurrentPositionTop)(snappingPoints[clampIndex]);
          animatedOffsetTop.value = rheostatSize - offset;
        } else {
          const clampIndex = Math.min(closestTopIndex.index - 1, closestBottomIndex.index);
          const offset = percentToRheostatSize(snappingPercentageArray[clampIndex]);
          runOnJS(setCurrentPositionBottom)(snappingPoints[clampIndex]);
          animatedOffsetBottom.value = -1 * offset;
        }
      }

      if (!shouldSnap) {
        const isOverlapping = (animatedOffsetTop.value + (-animatedOffsetBottom.value) + handleDelta > rheostatSize);
        if (panType === 'top') {
          if (isOverlapping) {
            animatedOffsetTop.value = (rheostatSize - (-animatedOffsetBottom.value)) - handleDelta;
          } else {
            const newOffset = event.translationY + animatedLastOffsetTop.value;
            const percentageFilled = (newOffset / rheostatSize) * 100;
            const value = algorithm.getValue(percentageFilled, minRange, maxRange);
            runOnJS(setCurrentPositionTop)(maxRange - clampWithinRange(value, minRange, maxRange));
          }
        } else {
          if (isOverlapping) {
            animatedOffsetBottom.value = -1 * ((rheostatSize - animatedOffsetTop.value) - handleDelta);
          } else {
            const newOffset = event.translationY + animatedLastOffsetBottom.value;
            const percentageFilled = (newOffset / rheostatSize) * 100;
            const value = algorithm.getValue(-percentageFilled, minRange, maxRange);
            runOnJS(setCurrentPositionBottom)(clampWithinRange(value, minRange, maxRange));
          }
        }
      }
    })
    .onFinalize(() => {
      if (panType === 'top') {
        animatedLastOffsetTop.value = clampWithinRange(animatedOffsetTop.value, 0, rheostatSize);
      } else {
        animatedLastOffsetBottom.value = clampWithinRange(animatedOffsetBottom.value, -rheostatSize, 0);
      }
    });

  const panTop = getPan('top');
  const panBottom = getPan('bottom');

  const animatedStylesTop = useAnimatedStyle(() => ({
    transform: [
      { translateY: animatedOffsetTop.value },
    ],
  }));

  const animatedStylesBottom = useAnimatedStyle(() => ({
    transform: [
      { translateY: animatedOffsetBottom.value },
    ],
  }));

  const animatedFilledBar = useAnimatedStyle(() => {
    const value = percentToRheostatSize(filledBarPercentage.value);

    return {
      position: 'absolute',
      top: animatedOffsetTop.value,
      height: value,
      backgroundColor: '#00857a',
      borderRadius: 3,
      width: 4,
    };
  });

  const computedValueTop = Math.round(currentPositionTop).toString();
  const computedValueBottom = Math.round(currentPositionBottom).toString();
  const diffTop = Math.abs(String(maxRange).length - computedValueTop.length);
  const diffBottom = Math.abs(
    String(maxRange).length - computedValueBottom.length
  );

  const dyanmmicStyles = StyleSheet.create({
    label: {
      alignItems: 'center',
      textAlign: 'center',
      width: rheostatWidth,
    },
    handleBottom: {
      backgroundColor: '#00857a',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      minWidth: 'fit-content',
      borderRadius: 3,
      zIndex: 1,

      left: handleSize + suffix.length * 4 + 16,
      width: handleSize,
      height: handleSize,
    },
    tooltipTop: {
      backgroundColor: '#00857a',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      borderRadius: 3,
      height: handleSize,
    },
  });


  return (
    <GestureHandlerRootView
      style={styles.container}
    >
      {/* filled bar */}
      <View
        style={[
          {
            height: rheostatSize,
          },
          styles.filledBar,
        ]}
      />

      {/* top label */}
      {topLabel && <View style={dyanmmicStyles.label}>{topLabel}</View>}


      <View style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'column',
        width: 200,
        height: 600,
        borderWidth: 1,
        borderColor: '#00857a',
        borderStyle: 'solid',
      }}>
        <Animated.View
          style={[
            animatedFilledBar,

          ]}
        />

        <View style={{
          position: 'absolute',
          height: rheostatSize,
          top: handleSize / 2,
        }}>
          {
            snappingPercentageArray.map((percentage, index) => {
              const width = 5 + ((percentage * 15) / 100);

              return (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    width: width,
                    height: 2,
                    backgroundColor: 'white',
                    top: `${100 - percentage}%`,
                    left: (handleSize / 2) + 8,
                  }}
                />
              );
            })
          }
        </View>

        <GestureDetector gesture={panTop}>
          <Animated.View
            style={[
              {
                width: handleSize,
                height: handleSize,
                zIndex: lastInteractedPan.value === 'top' ? 1 : 0,
              },
              styles.circle,
              animatedStylesTop,
            ]}
          >
            <Animated.View
              style={
                [
                  dyanmmicStyles.tooltipTop,
                  {
                    minWidth: 16 + (suffix.length * 8) + (String(maxRange).length * 8),
                  },
                  tooltipPosition === 'right' ? {
                    left: (handleSize / 2) + 32,
                  } : {
                    right: (handleSize / 2) + 32,
                  },
                ]
              }
            >
              <Text style={styles.labelText}>
                {`${Math.round(currentPositionTop)} ${suffix}`}
              </Text>

              <View
                style={[
                  styles.triangleLeft,
                  {
                    position: 'absolute',
                  },
                  tooltipPosition === 'right' ? {
                    left: -CONSTANTS.TRIANGLE_SIZE_Y,
                  } : {
                    right: -CONSTANTS.TRIANGLE_SIZE_Y,
                    transform: [
                      {
                        rotate: '180deg',
                      },
                    ],
                  },
                ]}
              />
            </Animated.View>
          </Animated.View>
        </GestureDetector>

        <GestureDetector gesture={panBottom}>
          <Animated.View
            style={[
              {
                width: handleSize,
                height: handleSize,
                zIndex: lastInteractedPan.value === 'bottom' ? 1 : 0,
              },
              styles.circle,
              animatedStylesBottom,
            ]}
          >

            <Animated.View
              style={
                [
                  dyanmmicStyles.tooltipTop,
                  {
                    minWidth: 16 + (suffix.length * 8) + (String(maxRange).length * 8),
                  },
                  tooltipPosition === 'right' ? {
                    left: (handleSize / 2) + 32,
                  } : {
                    right: (handleSize / 2) + 32,
                  },
                ]
              }
            >

              <Text style={styles.labelText}>
                {`${Math.round(currentPositionBottom)} ${suffix}`}
              </Text>

              <View
                style={[
                  styles.triangleLeft,
                  {
                    position: 'absolute',
                  },
                  tooltipPosition === 'right' ? {
                    left: -CONSTANTS.TRIANGLE_SIZE_Y,
                  } : {
                    right: -CONSTANTS.TRIANGLE_SIZE_Y,
                    transform: [
                      {
                        rotate: '180deg',
                      },
                    ],
                  },
                ]}
              />
            </Animated.View>



          </Animated.View>
        </GestureDetector>
      </View>

      {/* bottom label */}
      {
        bottomLabel && (
          <View style={dyanmmicStyles.label}>{bottomLabel}</View>
        )
      }

    </GestureHandlerRootView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  circle: {
    borderRadius: 500,
    backgroundColor: '#00857a',
  },
  triangleLeft: {
    borderTopWidth: CONSTANTS.TRIANGLE_SIZE_X,
    borderBottomWidth: CONSTANTS.TRIANGLE_SIZE_X,
    borderRightWidth: CONSTANTS.TRIANGLE_SIZE_Y,
    borderLeftWidth: 0,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#00857a',
    borderRightColor: '#00857a',
    position: 'absolute',
  },
  traingleRight: {
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
  filledBar: {
    width: 4,
    position: 'absolute',
    backgroundColor: '#b5b5b5',
    borderRadius: 3,
  },
  transparentText: {
    color: 'transparent',
  },

  labelText: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: 'white',
    fontSize: 13,
  }

});
