import React, { useRef } from 'react';
import {
    StyleSheet,
    View,
    Animated,
    Easing,
    ImageBackground,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../theme';
import { ChevronRightBold } from '@oxygen/icons';
import Image from '../Image/Image';
import Text from '../Text';
import {
    GREY_COLOR_MAP,
    BROWN_COLOR_MAP,
    BLUE_COLOR_MAP,
    RED_COLOR_MAP,
    COLOR_SHADES,
    COLOR_SHADE_INDEX,
} from './constants';
import { concatString } from '../utils/string';
import { testIdProps } from '../utils/testIdProps';
import { TEAL_COLOR_MAP } from './Badge.style';

const propTypes = {
    /** Custom style for the component */
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Primary content of the component. */
    text: PropTypes.string.isRequired,
    /** Secondary content of the component. */
    subText: PropTypes.node,
    /** Different sizes for the component */
    size: PropTypes.oneOf(['sm', 'md']),
    /** Color for the component. */
    color: PropTypes.oneOf(['teal', 'brown', 'blue', 'red', 'gray']).isRequired,
    /** The icon for the component. */
    icon: PropTypes.node,
    /** Text transformation of content. */
    /** To change the color Shades */
    shade: PropTypes.oneOf(['light', 'base', 'dark']),
    /** Type of the component. Type `ribbon` is applicable with `brown` color */
    type: PropTypes.oneOf(['ribbon', 'arrow', 'none']),
    /** Text transformation of content. */
    textTransform: PropTypes.oneOf([
        'none',
        'lowercase',
        'capitalize',
        'uppercase',
    ]),
    /** Shimmer effect for the badge */
    hasShine: PropTypes.bool,
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
};

const defaultProps = {
    style: '',
    size: 'md',
    shade: 'base',
    type: 'none',
    textTransform: 'none',
    hasShine: false,
};

const styles = StyleSheet.create({
    badgeWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        position: 'relative',
    },
    ribbonBorderStyle: {
        borderTopRightRadius: 3,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: theme.borderColor['info-900'],
    },
    noRibbonBorderStyle: {
        borderRadius: 2,
        overflow: 'hidden',
    },
    arrowSpaceRight: {
        paddingRight: theme.space[2],
    },
    arrowSpaceLeft: {
        marginLeft: theme.space[2],
    },
    ribbonIcon: {
        height: 28,
        width: 23,
        resizeMode: 'contain',
        position: 'absolute',
        top: 0,
        left: 0,
    },
    img: {
        width: theme.size[8],
        height: 120,
    },
    shimmer: {
        position: 'absolute',
        top: -100,
        left: theme.coordinates[0],
        overflow: 'hidden',
    },
    sm: {
        paddingLeft: theme.space[0.5],
        paddingRight: theme.space[0.5],
        textAlignVertical: 'center',
    },
    md: {
        paddingLeft: theme.space[2],
        paddingRight: theme.space[2],
        paddingTop: theme.space[1],
        paddingBottom: theme.space[1],
        textAlignVertical: 'center',
    },
    subTextStyles: {
        paddingLeft: theme.space[2],
        paddingRight: theme.space[2],
        paddingTop: theme.space[1],
        paddingBottom: theme.space[1],
        textAlignVertical: 'center',
        marginLeft: 'auto',
    },
    smOfferIcon: {
        marginLeft: theme.space[0.5],
    },
    mdOfferIcon: {
        marginLeft: theme.space[2],
    },
});

const getPrimaryTextBgColor = (color, shade) => {
    let bgColor;
    if (shade === 'base') {
        bgColor = color;
    } else {
        bgColor = `${color}-${shade}`;
    }

    const colorMap = {
        gray: GREY_COLOR_MAP,
        brown: BROWN_COLOR_MAP,
        blue: BLUE_COLOR_MAP,
        red: RED_COLOR_MAP,
    };

    if (color in colorMap) {
        bgColor = colorMap[color][bgColor];
        return theme.backgroundColor[bgColor];
    }

    return TEAL_COLOR_MAP[bgColor || 'teal'] || TEAL_COLOR_MAP.teal;
};

const getSecondaryTextBgColor = (color, shade) => {
    const darkerShadeIndex =
        color === 'teal' && shade === 'dark'
            ? COLOR_SHADE_INDEX[shade]
            : COLOR_SHADE_INDEX[shade] + 1;

    let bgColor;
    if (shade === 'light') {
        bgColor = `${color}`;
    } else {
        bgColor = `${color}-${COLOR_SHADES[darkerShadeIndex]}`;
    }

    const colorMap = {
        gray: GREY_COLOR_MAP,
        brown: BROWN_COLOR_MAP,
        blue: BLUE_COLOR_MAP,
        red: RED_COLOR_MAP,
    };

    if (color in colorMap) {
        bgColor = colorMap[color][bgColor];
        return theme.backgroundColor[bgColor];
    }

    return TEAL_COLOR_MAP[bgColor || 'teal'] || TEAL_COLOR_MAP.teal;
};

const getBadgeWrapperStyles = (color, shade, variant) => {
    let borderStyle;
    if (variant === 'ribbon' && color === 'brown') {
        borderStyle = styles.ribbonBorderStyle;
    } else {
        borderStyle = styles.noRibbonBorderStyle;
    }

    return {
        backgroundColor: getPrimaryTextBgColor(color, shade),
        ...borderStyle,
    };
};

const getBadgeTextStyles = (subText, size, isSmall, textTransform) => {
    const style = size === 'sm' ? styles.sm : styles.md;

    const badgeText = {
        fontSize: isSmall ? theme.fontSize[4.5] : theme.fontSize[5],
        fontFamily: subText
            ? theme.fontFamily.semiBold
            : theme.fontFamily.regular,
        color: theme.color['neutral-100'],
        textTransform: theme.textTransform[textTransform],
        ...style,
    };

    return badgeText;
};

const getSubtextStyles = (color, shade, size, isSmall, textTransform) => {
    const style = size === 'sm' ? styles.sm : styles.md;

    return {
        fontSize: isSmall ? theme.fontSize[4.5] : theme.fontSize[5],
        fontFamily: theme.fontFamily.bold,
        color: theme.color['neutral-100'],
        height: theme.size.full,
        backgroundColor: getSecondaryTextBgColor(color, shade),
        textTransform: theme.textTransform[textTransform],
        ...style,
    };
};

function Badge({
    style,
    text,
    subText,
    color,
    shade,
    size,
    icon,
    textTransform,
    type: variant,
    hasShine,
    'data-testing-id': testingName,
    ...otherProps
}) {
    const shimmerAnimation = useRef(new Animated.Value(0)).current;

    const startShimmerAnimation = () => {
        Animated.loop(
            Animated.timing(shimmerAnimation, {
                toValue: 1,
                duration: 6000,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    };

    hasShine && startShimmerAnimation();

    const getShimmerTranslateX = () =>
        shimmerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-200, 200],
        });

    const getShimmerTranslateY = () =>
        shimmerAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [-20, 20],
        });

    const badgeWrapperStyles = getBadgeWrapperStyles(color, shade, variant);

    const badgeWrapper = [styles.badgeWrapper, badgeWrapperStyles, style];
    if (variant === 'arrow') {
        badgeWrapper.push(styles.arrowSpaceRight);
    }

    const renderRibbon = () => (
        <Image
            style={styles.ribbonIcon}
            src="https://imgd.aeplcdn.com/0x0/cw/static/advantage/tags/authorised-ribbon.svg"
            alt="ribbon"
        />
    );

    const iconWrapperStyles =
        size === 'sm' ? styles.smOfferIcon : styles.mdOfferIcon;

    const renderIcon = () => <View style={iconWrapperStyles}>{icon}</View>;

    const badgeText = getBadgeTextStyles(
        subText,
        size,
        size === 'sm',
        textTransform
    );

    const badgeSubText = getSubtextStyles(
        color,
        shade,
        size,
        size === 'sm',
        textTransform
    );

    const renderSubText = () => <View style={badgeSubText}>{subText}</View>;

    const renderArrow = () => (
        <View style={styles.arrowSpaceLeft}>
            <ChevronRightBold size="xxsm" color="#fff" />
        </View>
    );

    return (
        <View
            style={badgeWrapper}
            {...otherProps}
            {...testIdProps(concatString(testingName, 'badge-wrapper'))}
        >
            {hasShine && (
                <Animated.View
                    style={[
                        styles.shimmer,
                        {
                            transform: [
                                { rotate: '45deg' },
                                { translateX: getShimmerTranslateX() },
                                { translateY: getShimmerTranslateY() },
                            ],
                        },
                    ]}
                >
                    <ImageBackground
                        source={{
                            uri:
                                'https://imgd.aeplcdn.com/0x0/media/cw/yjq9cbb_1676901.png',
                        }}
                        resizeMode="stretch"
                        style={styles.img}
                    />
                </Animated.View>
            )}
            {variant === 'ribbon' && color === 'brown' && renderRibbon()}
            {icon ? renderIcon() : null}
            <Text style={badgeText}>{text}</Text>
            {subText && renderSubText()}
            {variant === 'arrow' && renderArrow()}
        </View>
    );
}

Badge.propTypes = propTypes;
Badge.defaultProps = defaultProps;

export default Badge;
