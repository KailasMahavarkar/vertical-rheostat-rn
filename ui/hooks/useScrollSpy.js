/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useRef, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import useUiScroll from "./useUiScroll";
import { useDerivedValue, useSharedValue, withTiming, scrollTo } from "react-native-reanimated";

const SCROLL_ANIMATION_DURATION = 260;

function throttle(callback, limit) {
	let waiting = false;
	return function () {
		if (!waiting) {
			callback.apply(this, arguments);
			waiting = true;
			setTimeout(function () {
				waiting = false;
			}, limit);
		}
	};
}

export function getClosestIndex(array, target) {
	if (array.length === 0) {
		return { index: -1, value: 0 };
	}

	let left = 0;
	let right = array.length - 1;

	if (target <= array[0]) {
		return { index: 0, value: array[0] };
	}
	if (target >= array[array.length - 1]) {
		return { index: array.length - 1, value: array[array.length - 1] };
	}

	// Binary search to find the closest value
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

	const leftValue = array[left];
	const rightValue = array[right];

	const leftDiff = Math.abs(leftValue - target);
	const rightDiff = Math.abs(rightValue - target);

	return {
		index: leftDiff < rightDiff ? left : right,
		value: leftDiff < rightDiff ? leftValue : rightValue,
	};
}

const useScrollSpy = ({
	threshold = 0,
	onActiveIndexChange,
	customListStyle,
	listContentContainerStyle,
	styleType = "default",
	textTransform,
	hasFirstLastChildPadding = false,
	tabNavBgColor,
}) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [lastScrolledYPosition, setLastScrolledYPosition] = useState(0);
	const scrollXValue = useSharedValue(0);
	const scrollYValue = useSharedValue(0);

	// Animated refs for smooth scrolling
	const navListRef = useAnimatedRef();
	const contentRef = useAnimatedRef();

	// UI thread scroll handlers
	const handleNavListScroll = useUiScroll({ ref: navListRef });
	const handleContentScroll = useUiScroll({ ref: contentRef });

	const refs = {
		panePositions: useRef({}),
		sortedPanePositions: useRef([]),
		tabPositions: useRef({}),
	};

	const findActiveSection = (scrollPosition) => {
		const paneEntries = refs.sortedPanePositions.current.map((x) => Number(Number(x[1].y)));
		return getClosestIndex(paneEntries, scrollPosition + threshold + paneEntries[0]).index;
	};

	const handleScroll = ({ nativeEvent }) => {
		const scrollPosition = nativeEvent.contentOffset.y;
		const newActiveIndex = findActiveSection(scrollPosition);

		if (activeIndex === newActiveIndex) {
			return;
		}

		setActiveIndex(newActiveIndex);
		setLastScrolledYPosition(scrollPosition);
	};

	const registerPane = (index, layout) => {
		refs.panePositions.current = {
			...refs.panePositions.current,
			[index]: layout,
		};
		refs.sortedPanePositions.current = Object.entries(refs.panePositions.current).sort(
			([, a], [, b]) => a.y - b.y
		);
	};

	const registerTab = (index, layout) => {
		refs.tabPositions.current = {
			...refs.tabPositions.current,
			[index]: layout,
		};
	};

	const handleTabPress = (index) => {
		const { y } = refs.panePositions.current[index];
		const yOffset = y - lastScrolledYPosition;

        console.log("yOffset", yOffset);

		handleContentScroll({
			yOffset: yOffset,
		});

        // set lastScrolledYPosition to the new y position
        setLastScrolledYPosition(yOffset);
	};

	const TabList = ({ items }) => (
		<Animated.ScrollView
			ref={navListRef}
			horizontal
			showsHorizontalScrollIndicator={false}
			style={[{ flexGrow: 0 }, customListStyle]}
			// contentContainerStyle={listContentContainerStyle}
		>
			{items.map((item, index) => (
				<View
					key={index}
					onLayout={(e) => registerTab(index, e.nativeEvent.layout)}
					style={[
						{
							paddingHorizontal: hasFirstLastChildPadding ? 8 : 0,
							opacity: activeIndex === index ? 1 : 0.7,
						},
						index === 0 && { paddingLeft: styleType === "pill" ? 16 : 0 },
						index === items.length - 1 && {
							paddingRight: styleType === "pill" ? 16 : 0,
						},
					]}
				>
					<TouchableOpacity
						onPress={() => handleTabPress(index)}
						style={{
							backgroundColor: activeIndex === index ? tabNavBgColor : "transparent",
							padding: 12,
							borderRadius: styleType === "pill" ? 20 : 0,
						}}
					>
						<Text
							style={{
								textTransform,
								fontWeight: activeIndex === index ? "bold" : "normal",
							}}
						>
							{item.title}
						</Text>
					</TouchableOpacity>
				</View>
			))}
		</Animated.ScrollView>
	);

	const Section = ({ index, children }) => (
		<View onLayout={(e) => registerPane(index, e.nativeEvent.layout)}>{children}</View>
	);

	return {
		activeIndex,
		handleScroll,
		TabList,
		Section,
		contentRef,
	};
};
export default useScrollSpy;
