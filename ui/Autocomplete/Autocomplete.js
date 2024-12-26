import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Modal, Pressable, Text } from 'react-native';
import theme from '../theme';

import AutocompleteInput from './AutocompleteInput';
import AutocompleteMenuWrapper from './AutocompleteMenuWrapper';
import AutocompleteMenu from './AutocompleteMenu';
import { concatString } from '../utils/string';
import { testIdProps } from '../utils/testIdProps';
import { SafeAreaView } from 'react-native';

const propTypes = {
    /** If `true`, component will be focused on mount. */
    autoFocus: PropTypes.bool,
    /** Input text value of the component. */
    text: PropTypes.string,
    // input props
    /** Size of the component */
    size: PropTypes.oneOf(['lg', 'sm']),
    /** Icon for the component */
    inputIcon: PropTypes.oneOf(['search', 'arrow', 'none']),
    /** Icon position */
    iconPosition: PropTypes.oneOf(['left', 'right']),
    /** Component is disabled or not */
    disabled: PropTypes.bool,
    /** Placeholder for input */
    placeholder: PropTypes.string,
    /** Ref for the input */
    inputRef: PropTypes.string,
    // clear button props
    /** If `true`, there will be loader appear in input field */
    isLoading: PropTypes.bool,
    /** Callback function fired when clear button is clicked */
    onClear: PropTypes.func,
    /** label for clear text */
    label: PropTypes.string,
    /** If `true`, button will appear on if input has any value */
    clearButton: PropTypes.bool,
    /** default selected */
    selected: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    // menu
    labelKey: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    /** Max height for the menu */
    maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Menu item children */
    renderMenuItemChildren: PropTypes.element,
    /** Menu for component */
    renderMenu: PropTypes.func,
    /** Alignment of the menu */
    align: PropTypes.oneOf(['top', 'bottom']),
    /** Callback fired on change Input */
    onChange: PropTypes.func,
    /** Callback fired on menu disappear */
    onMenuHide: PropTypes.func,
    /** Callback fired on menu visible */
    onMenuShow: PropTypes.func,
    /** Callback fired on menu toggle */
    onMenuToggle: PropTypes.func,
    // Id for the Menu container
    menuId: PropTypes.string, // need to check do we need it or not
    /** If `true` then menu will be visible */
    isMenuShown: PropTypes.bool,
    /** If `true` then we can select multiple value */
    multiple: PropTypes.bool,
    /** If true, then it will stick to top with black overlay */
    isPopup: PropTypes.bool,
    /** Callback fired on click of blackout window */
    handleBlackoutWindowPressed: PropTypes.func,
    /** Callback fired on search or arrow is clicked */
    onIconPress: PropTypes.func,
    /** Key codes to remove tag. */
    removeKeys: PropTypes.arrayOf(
        PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    ),
    /** If `true`, component will be focused */
    isFocused: PropTypes.bool,
    /** Custom styles for the autocomplete input Container component */
    inputContainerStyle: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    /** Custom styles for the autocomplete menu Container */
    menuContainerStyle: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    // If `true`, will show no result found text.
    showNoResultMessage: PropTypes.bool,
    /** Display custom no result message */
    noResultMessage: PropTypes.string,
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
    /** Border for autocomplete input */
    hasBorder: PropTypes.bool,
    /** Autocomplete input suffix */
    inputSuffix: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    /** Style for input prefix. */
    inputSuffixStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Autocomplete input style */
    inputStyle: PropTypes.object,
    /** Custom input wrapper styles */
    inputWrapperStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Result for the autocomplete */
    results: PropTypes.arrayOf(PropTypes.object),
    /** tabIndex attribute for Input tag */
    tabIndex: PropTypes.number,
    /** will show scrollview of 60% width for tag input. scrollview will be disabled for user scrolling */
    showScroller: PropTypes.bool,
    /** Custom styles for the autocompleteInput wrapper */
    autocompleteInputWrapperStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
    ]),
    /** Margin top for menu-item wrapper */
    menuWrapperMarginTop: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    /** search label for menu items */
    searchLabel: PropTypes.string,
};

const defaultProps = {
    size: 'sm',
    inputIcon: 'none',
    iconPosition: 'left',
    disabled: false,
    autoFocus: false,
    isFocused: false,
    selected: null,
    multiple: false,
    isLoading: false,
    clearButton: false,
    label: 'Clear',
    placeholder: 'search',
    maxHeight: 300,
    flip: false,
    align: 'bottom',
    renderMenu: (results, searchLabel, menuProps) => (
        <AutocompleteMenu
            {...menuProps}
            options={results}
            searchLabel={searchLabel}
        />
    ),
    isMenuShown: false,
    labelKey: '',
    text: '',
    isPopup: false,
    inputContainerStyle: null,
    showNoResultMessage: false,
    noResultMessage: 'No Result Found',
    'data-testing-id': '',
    hasBorder: true,
    tabIndex: -1,
    inputSuffixStyle: null,
    inputStyle: null,
    showScroller: false,
    autocompleteInputWrapperStyle: null,
    menuWrapperMarginTop: 0,
};

const styles = StyleSheet.create({
    autocompleteContainer: {
        backgroundColor: theme.backgroundColor['neutral-100'],
        position: 'relative',
    },
    autocompleteModal: {
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
    },
    modalContent: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

const generateProps = (props, testingName) => {
    const {
        align,
        autoFocus,
        clearButton,
        disabled,
        dropup,
        flip,
        iconPosition,
        inputIcon,
        inputRef,
        isLoading,
        isMenuShown,
        isPopup,
        label,
        labelKey,
        maxHeight,
        menuId,
        multiple,
        onBlur,
        onChange,
        onChangeText,
        onClear,
        onPress,
        onFocus,
        onIconPress,
        onMenuHide,
        onMenuShow,
        onMenuToggle,
        placeholder,
        readOnly,
        renderMenu,
        renderMenuItemChildren,
        results,
        selected,
        size,
        text,
        isFocused,
        showNoResultMessage,
        noResultMessage,
        inputSuffix,
        inputSuffixStyle,
        hasBorder,
        inputStyle,
        tabIndex,
        inputWrapperStyle,
        showScroller,
        menuContainerStyle,
        menuWrapperMarginTop,
        autocompleteInputWrapperStyle,
        searchLabel,
    } = props;
    const inputProps = {
        disabled,
        innerRef: inputRef,
        multiple,
        onBlur,
        onClear,
        onChange,
        onChangeText,
        onFocus,
        placeholder,
        readOnly,
        selected,
        size,
        value: text,
        autoFocus,
        isLoading,
        // Below props are for autocompleteinput
        clearButton:
            clearButton &&
            !disabled &&
            ((selected && !!selected.length) || (text && !!text.length)),
        iconPosition,
        inputIcon,
        label,
        onIconPress,
        isFocused,
        'data-testing-id': testingName,
        hasBorder,
        suffix: inputSuffix,
        suffixStyle: inputSuffixStyle,
        style: inputStyle,
        tabIndex,
        wrapperStyle: inputWrapperStyle,
        showScroller,
        autocompleteInputWrapperStyle,
    };

    const menuWrapperProps = {
        align,
        dropup,
        flip,
        menuId,
        onMenuHide,
        onMenuShow,
        onMenuToggle,
        isPopup,
        maxHeight,
        renderMenu,
        results,
        show: isMenuShown,
        style: menuContainerStyle,
        'data-testing-id': testingName,
        menuWrapperMarginTop,
        searchLabel,
    };

    const menuProps = {
        align,
        isPopup,
        labelKey,
        onPress,
        renderMenuItemChildren,
        size,
        text,
        showNoResultMessage,
        noResultMessage,
        'data-testing-id': testingName,
    };

    return {
        inputProps,
        menuWrapperProps,
        menuProps,
    };
};

const renderChildren = (props, children) =>
    typeof children === 'function' ? children(props) : children;

const MenuWrapper = ({
    menuProps,
    renderMenu,
    results,
    menuId,
    searchLabel,
    ...props
}) => {
    return (
        <AutocompleteMenuWrapper {...props}>
            {renderMenu(results, searchLabel, { ...menuProps, id: menuId })}
        </AutocompleteMenuWrapper>
    );
};

const Autocomplete = ({
    children,
    inputContainerStyle,
    isPopup,
    handleBlackoutWindowPressed,
    searchLabel,
    'data-testing-id': testingName,
    ...props
}) => {
    const { inputProps, menuWrapperProps, menuProps } = generateProps(
        props,
        testingName
    );

    const renderContent = isPopup => {
        return (
            <View
                style={isPopup ? styles.autocompleteModal : null}
                {...testIdProps(
                    concatString(testingName, 'autocomplete-wrapper')
                )}
            >
                <View
                    style={[styles.autocompleteContainer, inputContainerStyle]}
                    {...testIdProps(
                        concatString(testingName, 'autocomplete-container')
                    )}
                >
                    <AutocompleteInput {...inputProps} />
                    {renderChildren(props, children)}
                </View>
                <MenuWrapper
                    {...menuWrapperProps}
                    menuProps={menuProps}
                    searchLabel={searchLabel}
                />
            </View>
        );
    };
    return (
        <>
            {!isPopup && renderContent(false)}
            <Modal
                animationType="fade"
                visible={isPopup}
                transparent
                onRequestClose={() => {
                    handleBlackoutWindowPressed &&
                        handleBlackoutWindowPressed();
                }}
            >
                <SafeAreaView />
                <Pressable
                    style={styles.modalContent}
                    onPress={event => {
                        if (event.target == event.currentTarget) {
                            handleBlackoutWindowPressed &&
                                handleBlackoutWindowPressed(event);
                        }
                    }}
                >
                    {renderContent(true)}
                </Pressable>
            </Modal>
        </>
    );
};

Autocomplete.propTypes = propTypes;
Autocomplete.defaultProps = defaultProps;

export default Autocomplete;
