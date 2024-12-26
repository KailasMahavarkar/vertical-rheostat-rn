import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableHighlight, Keyboard } from 'react-native';
import theme from '../theme';
import { concatString } from '../utils/string';
import { testIdProps } from '../utils/testIdProps';

import { renderNode } from '../utils/renderNode';

const propTypes = {
    /** If `true` then it is in active state */
    active: PropTypes.bool,
    /** If `true` then it is disabled */
    disabled: PropTypes.bool,
    /** Icon for component */
    icon: PropTypes.node,
    /** Callback fired on clicked */
    onPress: PropTypes.func,
    /** Right content for component */
    rightContent: PropTypes.string,
    /** Size of the component */
    size: PropTypes.oneOf(['lg', 'sm']),
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
};

const defaultProps = {
    active: false,
    disabled: false,
    onPress: null,
    size: 'sm',
};

const styles = StyleSheet.create({
    menuItemWrapper: {
        color: theme.color['neutral-1000'],
    },
    menuItemWrapperLarge: {
        paddingLeft: theme.space[4],
        paddingRight: theme.space[4],
    },
    menuItemWrapperSmall: {
        paddingLeft: theme.space[3],
        paddingRight: theme.space[3],
    },
    menuItemWrapperActive: {
        backgroundColor: theme.color['neutral-400'],
    },
    menuItemInActive: {
        backgroundColor: theme.color['neutral-100'],
    },
    menuItem: {
        paddingTop: theme.space[4],
        paddingBottom: theme.space[4],
        borderTopWidth: theme.borderWidth[1],
        borderColor: theme.borderColor['neutral-400'],
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    menuItemNoBorder: {
        borderTopWidth: theme.borderWidth[0],
    },
    leftContentWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    leftContentWidthFull: {
        flexBasis: '100%',
    },
    leftContentWidthCustom: {
        flexBasis: '90%',
    },
    leftContentWidthStyle: {
        flexBasis: '68%',
    },
    iconWrapper: {
        marginRight: theme.space[3],
        textAlign: 'center',
        fontSize: theme.fontSize[0],
    },
    rightContentWrapper: {
        fontSize: theme.fontSize[6],
        color: theme.color['neutral-1000'],
        fontFamily: theme.fontFamily.bold,
    },
});

const renderLeftContent = (children, testingName, icon, rightContentLength) => {
    const leftContentStyle = [
        styles.leftContentWrapper,
        rightContentLength > 0
            ? rightContentLength < 3
                ? styles.leftContentWidthCustom
                : styles.leftContentWidthStyle
            : styles.leftContentWidthFull,
    ];
    return icon ? (
        <View style={leftContentStyle}>
            <View
                {...testIdProps(concatString(testingName, 'icon'))}
                style={styles.iconWrapper}
            >
                {icon}
            </View>
            {renderNode(children)}
        </View>
    ) : (
        <View
            style={leftContentStyle}
            {...testIdProps(concatString(testingName, 'node'))}
        >
            {renderNode(children)}
        </View>
    );
};
const renderRightContent = (children, testingName) =>
    children ? (
        <View
            {...testIdProps(concatString(testingName, `content-${children}`))}
            style={styles.rightContentWrapper}
        >
            {renderNode(children, { style: styles['rightContentWrapper'] })}
        </View>
    ) : null;

const AutocompleteMenuItem = memo(
    ({
        active,
        children,
        disabled,
        onPress,
        icon,
        rightContent,
        size,
        style,
        'data-testing-id': testingName,
        ...props
    }) => {
        const isLarge = size === 'lg';
        const wrapperStyle = [
            style,
            styles.menuItemWrapper,
            isLarge ? styles.menuItemWrapperLarge : styles.menuItemWrapperSmall,
            active
                ? styles.menuItemWrapperActive
                : styles.menuItemWrapperInActive,
        ];

        const menuItemStyle = [
            styles.menuItem,
            props.position === 0 ? styles.menuItemNoBorder : null,
        ];

        const handleOnPress = event => {
            Keyboard.dismiss();
            !disabled && onPress && onPress(event, props);
        };

        return (
            <TouchableHighlight
                style={wrapperStyle}
                {...props}
                underlayColor={theme.backgroundColor['neutral-400']}
                activeOpacity={1}
                pointerEvents={disabled ? 'none' : 'auto'}
                onPress={handleOnPress}
            >
                <View
                    style={menuItemStyle}
                    {...testIdProps(concatString(testingName, 'menu-item'))}
                >
                    {renderLeftContent(
                        children,
                        testingName,
                        icon,
                        rightContent?.length
                    )}
                    {renderRightContent(rightContent, testingName)}
                </View>
            </TouchableHighlight>
        );
    }
);

AutocompleteMenuItem.propTypes = propTypes;
AutocompleteMenuItem.defaultProps = defaultProps;

export default AutocompleteMenuItem;
