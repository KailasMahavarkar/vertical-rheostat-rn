import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import theme from '../theme';

import MenuItem from './AutocompleteMenuItem';
import Highlighter from './Highlighter';
import { getOptionLabel } from '../utils/autocomplete';

import Text from '../Text';
import { concatString } from '../utils/string';

const propTypes = {
    /** If `true`, padding will be there */
    hasVerticalSpacing: PropTypes.bool,
    /**
     * Provides a hook for customized rendering of menu item contents.
     */
    renderMenuItemChildren: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.func,
    ]),
    /** Search text for Highlighter */
    text: PropTypes.string,
    // If `true`, will show no result found text.
    showNoResultMessage: PropTypes.bool,
    /** Display no result message */
    noResultMessage: PropTypes.string,
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
    /** search label for menu items */
    searchLabel: PropTypes.string,
};

const defaultProps = {
    renderMenuItemChildren: (option, { style, ...props }) => {
        const heightlighterStyle = [
            style,
            props.size === 'lg' ? styles.textLarge : styles.textSmall,
        ];
        const label = getOptionLabel(option, props.labelKey);

        return (
            <Highlighter
                search={props.text}
                style={heightlighterStyle}
                text={label}
            >
                {label}
            </Highlighter>
        );
    },
    text: '',
    hasVerticalSpacing: true,
    showNoResultMessage: false,
    noResultMessage: 'No Result Found',
};

const styles = StyleSheet.create({
    menu: {
        color: theme.color['neutral-1000'],
    },
    menuTopAlign: {
        paddingTop: theme.space[1],
        paddingBottom: theme.space[2],
    },
    menuBottomAlign: {
        paddingTop: theme.space[2],
        paddingBottom: theme.space[1],
    },
    textLarge: {
        fontSize: theme.fontSize['7.5'],
    },
    textSmall: {
        fontSize: theme.fontSize['6.5'],
    },
    header: {
        fontSize: theme.fontSize[6],
        color: theme.color['neutral-700'],
        fontFamily: theme.fontFamily.semiBold,
        paddingTop: theme.space[1],
        paddingBottom: theme.space[1],
        paddingLeft: theme.space[4],
        paddingRight: theme.space[4],
    },
    noResultText: {
        paddingTop: theme.space[4],
        paddingBottom: theme.space[4],
        color: theme.color['neutral-1000'],
    },
    noResultLargeText: {
        fontSize: theme.fontSize['7.5'],
        paddingLeft: theme.space[4],
        paddingRight: theme.space[4],
    },
    noResultSmallText: {
        fontSize: theme.fontSize['6.5'],
        paddingLeft: theme.space[3],
        paddingRight: theme.space[3],
    },
    searchLabelText: {
        fontSize: theme.fontSize[6],
        color: theme.color['neutral-900'],
        fontWeight: theme.fontWeight.bold,
        paddingTop: theme.space[6],
        paddingBottom: theme.space[0.5],
        marginLeft: theme.space[4],
    },
});

const AutocompleteMenu = memo(
    ({
        labelKey,
        options,
        renderMenuItemChildren,
        children,
        size,
        hasVerticalSpacing,
        align,
        style,
        text,
        onPress,
        'data-testing-id': testingName,
        showNoResultMessage,
        noResultMessage,
        searchLabel,
        ...props
    }) => {
        const renderMenuItem = (option, idx) => {
            const label = getOptionLabel(option, labelKey);

            const menuItemProps = {
                key: idx,
                label,
                position: idx,
                size,
                onPress,
                ...option,
            };

            props.children = children;
            props.labelKey = labelKey;
            props.text = text;
            props.size = size;

            return (
                <MenuItem
                    data-testing-id={concatString(
                        testingName,
                        `autocomplete-list-item-${idx}`
                    )}
                    {...menuItemProps}
                >
                    {renderMenuItemChildren(option, props)}
                </MenuItem>
            );
        };

        const wrapperAlignmentStyle =
            align === 'top' ? styles.menuTopAlign : styles.menuBottomAlign;
        const wrapperStyle = [
            style,
            styles.menu,
            hasVerticalSpacing ? wrapperAlignmentStyle : null,
        ];

        const noResultTextStyle = [
            styles.noResultText,
            size === 'sm' ? styles.noResultSmallText : styles.noResultLargeText,
        ];

        return (
            <View style={wrapperStyle}>
                {children}
                {searchLabel && (
                    <Text style={styles.searchLabelText}>{searchLabel}</Text>
                )}
                {options && options.length !== 0 && !children
                    ? options.map(renderMenuItem)
                    : showNoResultMessage && (
                          <Text style={noResultTextStyle}>
                              {noResultMessage}
                          </Text>
                      )}
            </View>
        );
    }
);

AutocompleteMenu.Header = ({ style, ...props }) => {
    const headerStyle = [styles.header, style];

    return <Text style={headerStyle} {...props} />;
};

AutocompleteMenu.propTypes = propTypes;
AutocompleteMenu.defaultProps = defaultProps;

export default AutocompleteMenu;
