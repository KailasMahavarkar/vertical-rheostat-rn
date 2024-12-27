/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
import React, { useCallback, useRef, useState } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import useUiScroll from "./useUiScroll";

const SCROLL_ANIMATION_DURATION = 260;

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
	isNested = false, // Add isNested prop
	parentScrollEnabled = true, // Add control for parent scroll
}) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const isScrollingRef = useRef(false);
	const lastScrollY = useRef(0);

	const navListRef = useAnimatedRef();
	const contentRef = useAnimatedRef();

	const handleNavListScroll = useUiScroll({ ref: navListRef });
	const handleContentScroll = useUiScroll({ ref: contentRef });

	const refs = {
		panePositions: useRef({}),
		sortedPanePositions: useRef([]),
		tabPositions: useRef({}),
		scrollBoundaries: useRef({ top: 0, bottom: 0 }), // Track scroll boundaries
	};

	const findActiveSection = (scrollPosition) => {
		const paneEntries = refs.sortedPanePositions.current.map((x) => Number(Number(x[1].y)));
		return getClosestIndex(paneEntries, scrollPosition + threshold + paneEntries[0]).index;
	};

	const handleScroll = useCallback(
		({ nativeEvent }) => {
			const { contentOffset, layoutMeasurement, contentSize } = nativeEvent;
			const { y: currentPosition } = contentOffset;

			// Handle nested scrolling behavior
			if (isNested) {
				const isAtTop = currentPosition <= 0;
				const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height;

				// Store boundaries for future reference
				refs.scrollBoundaries.current = {
					top: isAtTop,
					bottom: isAtBottom,
				};

				// Only allow parent scroll when at boundaries
				if (!isAtTop && !isAtBottom && !parentScrollEnabled) {
					return;
				}
			}

			// Debounce scroll handling
			if (isScrollingRef.current) {
				return;
			}

			isScrollingRef.current = true;

			// Only update if scroll position changed significantly
			if (Math.abs(currentPosition - lastScrollY.current) > 5) {
				const newActiveIndex = findActiveSection(currentPosition);

				if (newActiveIndex !== activeIndex) {
					setActiveIndex(newActiveIndex);
					onActiveIndexChange?.(newActiveIndex);

					// Smooth scroll tab into view
					const currentTab = refs.tabPositions.current[newActiveIndex];
					if (currentTab) {
						const listWidth = navListRef.current?.offsetWidth || 0;
						const xOffset = Math.max(
							0,
							currentTab.x - listWidth / 2 + currentTab.width / 2
						);
						handleNavListScroll({
							xOffset,
							duration: SCROLL_ANIMATION_DURATION,
						});
					}
				}

				lastScrollY.current = currentPosition;
			}

			// Reset scroll lock after a delay
			setTimeout(() => {
				isScrollingRef.current = false;
			}, 50);
		},
		[activeIndex, isNested, parentScrollEnabled, onActiveIndexChange]
	);

	const scrollToSection = useCallback(
		(index) => {
			const section = refs.panePositions.current[index];
			if (section) {
				handleContentScroll({
					yOffset: section.y - threshold,
					duration: SCROLL_ANIMATION_DURATION,
				});
			}
		},
		[threshold, handleContentScroll]
	);

	// Rest of the implementation remains the same...
	const registerPane = useCallback((index, layout) => {
		refs.panePositions.current = {
			...refs.panePositions.current,
			[index]: layout,
		};
		refs.sortedPanePositions.current = Object.entries(refs.panePositions.current).sort(
			([, a], [, b]) => a.y - b.y
		);
	}, []);

	const registerTab = useCallback((index, layout) => {
		refs.tabPositions.current = {
			...refs.tabPositions.current,
			[index]: layout,
		};
	}, []);

	const handleTabPress = useCallback(
		(index) => {
			setActiveIndex(index);
			onActiveIndexChange?.(index);
			scrollToSection(index);
		},
		[onActiveIndexChange, scrollToSection]
	);

	const TabList = useCallback(
		({ items }) => (
			<Animated.ScrollView
				ref={navListRef}
				horizontal
				showsHorizontalScrollIndicator={false}
				style={[{ flexGrow: 0 }, customListStyle]}
				contentContainerStyle={listContentContainerStyle}
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
								backgroundColor:
									activeIndex === index ? tabNavBgColor : "transparent",
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
		),
		[
			activeIndex,
			customListStyle,
			listContentContainerStyle,
			hasFirstLastChildPadding,
			styleType,
			tabNavBgColor,
			textTransform,
			handleTabPress,
			registerTab,
		]
	);

	const Section = useCallback(
		({ index, children }) => (
			<View onLayout={(e) => registerPane(index, e.nativeEvent.layout)}>{children}</View>
		),
		[registerPane]
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
