import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from 'react-native-reanimated';
import PropTypes from 'prop-types';
import AnimatedRipple from '../AnimatedRipple';
import Badge from '../Badge';
import { testIdProps } from '../utils/testIdProps';
import { concatString } from '../utils/string';
import theme from '../theme';

const propTypes = {
    /** Text transformation of content. */
    textTransform: PropTypes.oneOf(['lowercase', 'capitalize', 'uppercase']),
    /** Callback fired on tab is clicked */
    handleClick: PropTypes.func,
    /** style type for the component */
    styleType: PropTypes.oneOf(['default', 'pill']),
    /** An custom scroll event for  scrollspy component */
    onScrollEmitter: PropTypes.object.isRequired,
    /** Custom style for the component */
    styles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** The Nav List Element container reference (ref). */
    navListElementsRef: PropTypes.object,
    /** Style for the First item of Navlist */
    firstItemStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Style for the Last item of Navlist */
    lastItemStyles: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Single tab of NavList  */
    item: PropTypes.object,
    /** Index of the component in the list */
    index: PropTypes.number,
    /** Callback fired for setting the Nav position */
    setNavPosition: PropTypes.func,
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
};

const defaultProps = {
    textTransform: 'uppercase',
    styleType: 'default',
};

const getTextColorStyles = isActive => ({
    color: isActive ? theme.color['secondary-900'] : theme.color['neutral-900'],
});

const getListItemTextStyles = (active, textTransform) => {
    const baseStyles = {
        fontSize: theme.fontSize['6.5'],
        fontFamily: theme.fontFamily.bold,
        textTransform: theme.textTransform[textTransform],
        color: active
            ? theme.color['secondary-900']
            : theme.color['neutral-900'],
    };

    const colorStyles = getTextColorStyles(active);

    return [baseStyles, colorStyles];
};

const getListItemRippleStyles = (styles, styleType, active) => {
    const pillBorderStyles = {
        borderColor: active
            ? theme.borderColor['secondary-900']
            : theme.borderColor['neutral-900'],
        borderRadius: theme.borderRadius.pill,
    };

    const tabStyles =
        styleType === 'pill'
            ? [pillBorderStyles, styles.pillTab, { paddingBottom: 7 }]
            : [styles.tab];

    return tabStyles;
};

const NavListItem = ({
    textTransform,
    handleClick,
    styleType,
    onScrollEmitter,
    styles,
    navListElementsRef,
    lastItemStyles,
    firstItemStyles,
    item,
    index,
    setNavPosition,
    'data-testing-id': testingName,
}) => {
    const isCurrentNavListItemActive = useSharedValue(index === 0);

    useEffect(() => {
        const onNavListItemChange = ({ activeIndex }) => {
            if (isCurrentNavListItemActive.value && activeIndex !== index) {
                isCurrentNavListItemActive.value = false;
            } else if (activeIndex === index) {
                isCurrentNavListItemActive.value = true;
            }
        };

        onScrollEmitter?.on('onNavListItemChange', onNavListItemChange);
        return () => {
            onScrollEmitter?.off('onNavListItemChange', onNavListItemChange);
        };
    }, [onScrollEmitter]);

    const active = item.active === index || isCurrentNavListItemActive.value;

    item.index = index;

    const tabListItemStyles =
        index === 0
            ? [firstItemStyles]
            : index === navListElementsRef.current.length - 1
            ? [lastItemStyles]
            : [styles.scrollSpyListItem];

    // reanimated styles for border.
    const tabListItemStyle = useAnimatedStyle(() => {
        return {
            opacity: isCurrentNavListItemActive.value ? 1 : 0,
        };
    }, []);

    const listItemTextStyles = getListItemTextStyles(active, textTransform);

    const activeTextStyle = useAnimatedStyle(() => {
        return {
            color: isCurrentNavListItemActive.value
                ? theme.color['secondary-900']
                : theme.color['neutral-900'],
        };
    }, []);

    const pillAnimatedStyle = useAnimatedStyle(() => {
        if (styleType !== 'pill') {
            return {};
        }
        return {
            borderColor: isCurrentNavListItemActive.value
                ? theme.borderColor['secondary-900']
                : theme.borderColor['neutral-900'],
        };
    }, []);

    return (
        <View
            style={tabListItemStyles}
            key={index}
            data-index={index}
            onLayout={e => setNavPosition(e, index)}
        >
            <AnimatedRipple
                style={[
                    getListItemRippleStyles(styles, styleType, active),
                    pillAnimatedStyle,
                ]}
                onPress={event => {
                    handleClick(event, item.index);
                }}
            >
                <Animated.Text
                    {...testIdProps(
                        concatString(
                            testingName,
                            `scrollspy-list-item-${item?.title ||
                                item?.description}`
                        )
                    )}
                    style={[listItemTextStyles, activeTextStyle]}
                >
                    {item?.title}
                </Animated.Text>
                {item?.sponsoredText && (
                    <Badge
                        textTransform="capitalize"
                        style={styles.sponsoredText}
                        text={item?.sponsoredText}
                        size="sm"
                        color={item?.sponsoredBgColor}
                    />
                )}
                {styleType !== 'pill' && (
                    <Animated.View
                        style={[styles.activeBar, tabListItemStyle]}
                    />
                )}
            </AnimatedRipple>
        </View>
    );
};

NavListItem.propTypes = propTypes;
NavListItem.defaultProps = defaultProps;

export default React.memo(NavListItem);
