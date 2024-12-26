import React, { memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ScrollView, StyleSheet } from 'react-native';
import theme from '../theme';

const propTypes = {
    /** Custom styles for the autocomplete menu Container */
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Alignment of the menu */
    align: PropTypes.oneOf(['top', 'bottom']),
    /** Max height for the menu */
    maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Margin top for menu-item wrapper */
    menuWrapperMarginTop: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    /** Callback fired on menu disappear */
    onMenuHide: PropTypes.func,
    /** Callback fired on menu visible */
    onMenuShow: PropTypes.func,
    /** Callback fired on menu toggle */
    onMenuToggle: PropTypes.func,
    /** If `true` then menu will be visible */
    show: PropTypes.bool,
};

const defaultProps = {
    align: 'bottom',
    maxHeight: 300,
    menuWrapperMarginTop: 0,
    show: false,
};

const styles = StyleSheet.create({
    wrapper: {
        borderRightWidth: theme.borderWidth[1],
        borderLeftWidth: theme.borderWidth[1],
        backgroundColor: theme.color['neutral-100'],
        zIndex: 1,
        overflow: 'hidden',
        borderColor: theme.borderColor['neutral-600'],
        position: 'relative',
        width: theme.size.full,
    },
    wrapperTop: {
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        borderTopWidth: theme.borderWidth[1],
    },
    wrapperBottom: {
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 3,
        borderBottomWidth: theme.borderWidth[1],
    },
});

const AutocompleteMenuWrapper = memo(
    ({
        align,
        children,
        maxHeight,
        onMenuHide,
        onMenuShow,
        onMenuToggle,
        style,
        show,
        menuWrapperMarginTop,
        ...props
    }) => {
        useEffect(() => {
            if (show) {
                onMenuShow && onMenuShow(show);
            } else {
                onMenuHide && onMenuHide(show);
            }
            onMenuToggle && onMenuToggle(show);
        }, [show]);

        const wrapperStyle = [
            styles.wrapper,
            align === 'top' ? styles.wrapperTop : styles.wrapperBottom,
            { maxHeight },
            menuWrapperMarginTop ? { marginTop: menuWrapperMarginTop } : null,
            style,
        ];
        return show ? (
            <ScrollView
                style={wrapperStyle}
                containerStyle={maxHeight}
                {...props}
                keyboardShouldPersistTaps={'handled'}
            >
                {children}
            </ScrollView>
        ) : null;
    }
);

AutocompleteMenuWrapper.propTypes = propTypes;
AutocompleteMenuWrapper.defaultProps = defaultProps;

export default AutocompleteMenuWrapper;
