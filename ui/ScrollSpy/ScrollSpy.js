import React, { useEffect, useRef, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import ScrollSpyPane from "./ScrollSpyPane";
import { View, StyleSheet } from "react-native";
import omit from "omit.js";
import theme from "../theme";
import { testIdProps } from "../utils/testIdProps";
import { concatString } from "../utils/string";
import NavListItem from "./NavListItem";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import useUiScroll from "../hooks/useUiScroll";

const styles = StyleSheet.create({
	scrollSpyListBorder: {
		borderBottomWidth: theme.borderWidth[1],
		borderColor: theme.borderColor["neutral-400"],
		borderStyle: "solid",
	},
	scrollSpyListItem: {
		paddingHorizontal: theme.space[1],
	},
	scrollSpyList: {
		display: "flex",
		flexDirection: "row",
	},
	pillTab: {
		paddingTop: theme.space[2],
		paddingHorizontal: theme.space[5],
		borderWidth: theme.borderWidth[1],
		borderStyle: "solid",
		borderRadius: theme.borderRadius.pill,
	},
	tab: {
		paddingVertical: theme.space[4],
		paddingHorizontal: theme.space[3],
	},
	activeBar: {
		position: "absolute",
		height: theme.size[1],
		bottom: theme.size[0],
		right: theme.space[3],
		left: theme.space[3],
		backgroundColor: theme.color["secondary-900"],
	},
	sponsoredText: {
		position: "absolute",
		top: 5,
		right: theme.space[3],
	},
});

const propTypes = {
	/** The scrollable container Animated reference (ref) for smooth scrolling on Ui Thread. */
	scrollableContainerAnimatedRef: PropTypes.object,
	/** Custom style for the component */
	customStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	/** Children for the component */
	children: PropTypes.node.isRequired,
	/** Callback fired with return value `activeTabIndex` when clicked tab data is rendered */
	onTabSwitch: PropTypes.func,
	/** The scrollable container reference (ref). */
	scrollableContainer: PropTypes.object,
	/** style type for the component */
	styleType: PropTypes.oneOf(["default", "pill"]),
	/** If `true`, the scrollspy should stick when scrolled */
	shouldStick: PropTypes.bool,
	/** Text transformation of content. */
	textTransform: PropTypes.oneOf(["lowercase", "capitalize", "uppercase"]),
	/** The value at which navigation stick */
	threshold: PropTypes.number,
	/** An custom scroll event for  scrollspy component */
	onScrollEmitter: PropTypes.object.isRequired,
	/** Custom style for fixed navigation wrapper. */
	customListStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	/** Custom contentContainerStyle for fixed navigation wrapper. */
	listContentContainerStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
	/** Z-index value for the component. */
	zIndexStyle: PropTypes.number,
	/** If `true`, It will add padding left to the first child and padding right to last child */
	hasFirstLastChildPadding: PropTypes.bool,
	/** Scroll spy tab nav's backgound color. */
	tabNavBgColor: PropTypes.oneOf(["white", "transparent"]),
	/** Value for data testing attribute. */
	"data-testing-id": PropTypes.string.isRequired,
    
    shouldRenderContainer: PropTypes.bool,

    shouldRenderNavList: PropTypes.bool,
};

const defaultProps = {
	customStyles: null,
	textTransform: "uppercase",
	styleType: "default",
	threshold: 0,
	shouldStick: true,
	zIndexStyle: theme.zIndex[1],
	hasFirstLastChildPadding: false,
	tabNavBgColor: "white",
	listContentContainerStyle: null,
	scrollableContainerAnimatedRef: null,
    shouldRenderContainer: true,
    shouldRenderNavList: true,
};

const getScrollSpyListStyles = (styleType, tabNavBgColor) => {
	const colorMapping = {
		white: "neutral-100",
		transparent: "transparent",
	};

	const baseStyles = {
		backgroundColor: theme.backgroundColor[colorMapping[tabNavBgColor]],
	};

	const paddingStyles =
		styleType === "pill"
			? {
					paddingTop: theme.space[4],
					paddingBottom: theme.space[4],
			  }
			: null;
	return [baseStyles, paddingStyles, styles.scrollSpyList];
};

const getTabListContainerStyles = (zIndexStyle) => {
	const scrollSpyListBorderStyles = styles.scrollSpyListBorder;

	const baseStyles = {
		zIndex: theme.zIndex[zIndexStyle],
	};

	return [baseStyles, scrollSpyListBorderStyles];
};

const getScrollSpyListWrapperStyles = (styleType, isFixed) => {
	return {
		userSelect: "none",
		height: styleType === "pill" ? theme.size[18] : theme.size[12],
		position: isFixed ? "absolute" : "relative",
		top: theme.space[0],
		left: theme.space[0],
		zIndex: theme.zIndex[3],
		elevation: theme.zIndex[3],
	};
};

const ScrollSpy = (props) => {
	const {
		customStyles,
		children,
		scrollableContainer,
		styleType,
		textTransform,
		threshold,
		onScrollEmitter,
		onScrollSpyScroll,
		customListStyle,
		listContentContainerStyle,
		zIndexStyle,
		hasFirstLastChildPadding,
		tabNavBgColor,
		scrollableContainerAnimatedRef,
		shouldStick,
		"data-testing-id": testingName,
	} = props;
	const paneRef = useRef({});
	const sortedPanelRef = useRef([]);
	const scrollSpyOffsetRef = useRef({});
	const tabPositionsRef = useRef({});
	const navListElementsRef = useRef([]);
	const tabRef = useRef();
	const navListRef = useAnimatedRef();

	const handleNavListScroll = useUiScroll({ ref: navListRef });
	const handlePaneScroll = useUiScroll({
		ref: scrollableContainerAnimatedRef,
	});

	const onScrollToTab = (xOffset) => {
		handleNavListScroll({ xOffset, duration: 120 });
	};

	const onStickyTabChange = (tabIndex) => {
		handleClick(null, tabIndex);
	};

	useEffect(() => {
		if (onScrollEmitter) {
			onScrollEmitter.on("onScrollToTab", onScrollToTab);
			// !shouldStick && onScrollEmitter.on("scrollSpyScroll", handleScroll); // attach only when scrollspy is non-sticky.
			// !shouldStick && onScrollEmitter.on("onStickyTabChange", onStickyTabChange); // attach only when ScrollSpy is non-sticky.
		}

		return () => {
			if (onScrollEmitter) {
				// onScrollEmitter.off("onScrollToTab", onScrollToTab);
				// !shouldStick && onScrollEmitter.off("scrollSpyScroll", handleScroll);
				// !shouldStick && onScrollEmitter.off("onStickyTabChange", onStickyTabChange);
			}
		};
	}, [onScrollEmitter, threshold]);

	const findPositionByScrollValue = useCallback((paneEntries, scrollPosition, threshold) => {
		let left = 0,
			right = paneEntries.length - 1;

		while (left <= right) {
			const mid = Math.floor((left + right) / 2);
			const item = paneEntries[mid][1];

			const scrollY = scrollPosition + threshold;

			if (item?.y <= scrollY && scrollY <= item?.y + item?.height) {
				return paneEntries[mid][0]; // Found the item
			} else if (item.y + item.height < scrollY) {
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}

		return -1;
	}, []);

	const handleScroll = ({ nativeEvent }) => {
		const { y: currentPosition } = nativeEvent.contentOffset;
		const paneEntries = sortedPanelRef.current;

		const activeIndex = findPositionByScrollValue(paneEntries, currentPosition, threshold);

		onScrollSpyScroll({
			activeIndex,
			currentPosition,
			yOffsetBYIndex: getYOffsetByIndex(activeIndex),
		});

		// if (activeIndex !== -1) {
		// 	const index = Number(activeIndex);
		// 	onScrollEmitter?.emit("onScrollToTab", getYOffsetByIndex(index));
		// 	onScrollEmitter?.emit("onNavListItemChange", {
		// 		activeIndex: index,
		// 	});
		// }
	};

	const getYOffsetByIndex = useCallback((index) => {
		const currentTabWidth = tabPositionsRef.current[index]?.width || 0;
		const tillCurrentTabWidths =
			(tabPositionsRef.current[index]?.prefixWidthSum || 0) - currentTabWidth;
		return index === 0 ? -currentTabWidth : tillCurrentTabWidths;
	}, []);

	const scrollToVertialPane = useCallback(
		(tabIndex) => {
			const scrollSpyPanePosition = paneRef.current[tabIndex];
			const container = scrollableContainer && scrollableContainer.current;
			if (scrollSpyPanePosition) {
				const yOffset = scrollSpyPanePosition.y + scrollSpyOffsetRef.current.y - threshold;
				if (scrollableContainerAnimatedRef) {
					// Scroll on Ui Thread.
					handlePaneScroll({ yOffset, duration: 120 });
				} else if (container) {
					// Scroll on JS Thread.
					container.scrollTo({
						y: yOffset,
						animated: true,
					});
				}
			}
		},
		[threshold, handlePaneScroll]
	);

	const handleClick = useCallback(
		(event, index) => {
			const tabIndex = Number(index);
			if (!shouldStick) {
				// as Sticky tabs has no pane's, don't bother executing this block.
				onScrollEmitter?.emit("onScrollToTab", getYOffsetByIndex(tabIndex));
				onScrollEmitter?.emit("onNavListItemChange", {
					activeIndex: tabIndex,
				});

				scrollToVertialPane(tabIndex);
			}

			const navList = navListElementsRef.current;

			if (navList[index]?.onTabClick) {
				navList[index].onTabClick(event, tabIndex);
			}
		},
		[onScrollEmitter, scrollToVertialPane, getYOffsetByIndex, !shouldStick]
	);

	const getNavList = () => {
		let hasActiveTab = false;
		navListElementsRef.current = [];
		React.Children.map(children, (element) => {
			if (!React.isValidElement(element) || element.type.displayName !== "ScrollSpyPane")
				return;
			const { title, active, sponsoredText, sponsoredBgColor, onTabClick, description } =
				element.props;

			const array = {
				title,
				description,
			};
			if (sponsoredText) {
				array.sponsoredText = sponsoredText;
			}
			if (sponsoredBgColor) {
				array.sponsoredBgColor = sponsoredBgColor;
			}
			if (onTabClick) {
				array.onTabClick = onTabClick;
			}
			if (active && !hasActiveTab) {
				hasActiveTab = true;
				array.active = true;
			}
			navListElementsRef.current = [...navListElementsRef.current, array];
		});
	};

	const setNavPosition = useCallback((e, idx) => {
		tabPositionsRef.current = {
			...tabPositionsRef.current,
			[idx]: { ...(e?.nativeEvent?.layout || {}) },
		};
		if (Object.keys(tabPositionsRef.current).length === navListElementsRef.current.length) {
			for (let index = 0; index < navListElementsRef.current.length; index++) {
				tabPositionsRef.current[index] = {
					...tabPositionsRef.current[index],
					prefixWidthSum: getPrefixWidth(
						tabPositionsRef.current[index].width || 0,
						index
					),
				};
			}
		}
	}, []);

	const getPrefixWidth = useCallback((width, idx) => {
		const prefixWidthSum =
			idx - 1 >= 0 ? (tabPositionsRef.current[idx - 1]?.prefixWidthSum || 0) + width : width;
		return prefixWidthSum;
	}, []);

	const scrollSpyOffesetSetterFunction = useCallback((e) => {
		scrollSpyOffsetRef.current = e.nativeEvent.layout;
	}, []);

	const renderNavList = () => {
		getNavList();
		const tabListWrapperStyles = getScrollSpyListWrapperStyles(styleType, false);

		const tabListContainerClasses = [
			styles.scrollSpyListBorder,
			getTabListContainerStyles(zIndexStyle),
		];
		const tabListStyles = getScrollSpyListStyles(styleType, tabNavBgColor);
		const firstItemStyles = {
			paddingLeft:
				styleType === "pill"
					? theme.space[4]
					: hasFirstLastChildPadding
					? theme.space[1]
					: theme.space[0],
			paddingRight: theme.space[1],
		};
		const lastItemStyles = {
			paddingRight:
				styleType === "pill"
					? theme.space[4]
					: hasFirstLastChildPadding
					? theme.space[1]
					: theme.space[0],
			paddingLeft: theme.space[1],
		};

		return (
			<View
				style={tabListWrapperStyles}
				{...testIdProps(concatString(testingName, "scrollspy-wrapper"))}
			>
				<View style={tabListContainerClasses}>
					<Animated.FlatList
						ref={navListRef}
						showsHorizontalScrollIndicator={false}
						horizontal
						data={navListElementsRef.current} // Use the data prop
						keyExtractor={(item, index) => index.toString()} // Set a key extractor
						renderItem={({ item, index }) => {
							return (
								<NavListItem
									textTransform={textTransform}
									handleClick={handleClick}
									styleType={styleType}
									onScrollEmitter={onScrollEmitter}
									styles={styles}
									navListElementsRef={navListElementsRef}
									lastItemStyles={lastItemStyles}
									firstItemStyles={firstItemStyles}
									item={item}
									index={index}
									setNavPosition={setNavPosition}
								/>
							);
						}}
						style={[tabListStyles, customListStyle]}
						contentContainerStyle={listContentContainerStyle}
					/>
				</View>
			</View>
		);
	};

	const setContainerPosition = useCallback((e, idx) => {
		paneRef.current = { ...paneRef.current, [idx]: e?.nativeEvent?.layout };
		const sortedPanes = Object.entries(paneRef.current).sort(([, a], [, b]) => a.y - b.y);
		sortedPanelRef.current = sortedPanes;
	}, []);

	const renderContainer = useMemo(() => {
		let paneCounter = 0;
		let noPaneCounter = 100;
		return (
			<>
				{React.Children.map(children, (item) => {
					if (!React.isValidElement(item)) {
						return;
					}

					const index =
						item.type.displayName === "ScrollSpyPane" ? paneCounter++ : noPaneCounter++;

					return (
						<View
							key={index}
							data-pane={index}
							onLayout={(e) => setContainerPosition(e, index)}
						>
							{item}
						</View>
					);
				})}
			</>
		);
	}, [children]);

	const tabsProps = omit(props, [
		"children",
		"scrollableContainer",
		"styleType",
		"textTransform",
		"threshold",
		"onTabSwitch",
		"tabNavBgColor",
		"listContentContainerStyle",
	]);

	return (
		<View
			style={customStyles}
			onLayout={(e) => scrollSpyOffesetSetterFunction(e)}
			ref={tabRef}
			{...tabsProps}
		>
            {
                props.shouldRenderNavList && renderNavList()
            }
            {
                props.shouldRenderContainer && renderContainer
            }
		</View>
	);
};

ScrollSpy.Pane = ScrollSpyPane;

ScrollSpy.propTypes = propTypes;
ScrollSpy.defaultProps = defaultProps;

export default ScrollSpy;
