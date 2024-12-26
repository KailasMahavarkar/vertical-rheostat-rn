import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Pressable } from 'react-native';
import theme from '../theme';

import Text from '../Text';
import Input from '../Input/InputWithLoader';
import { TouchableOpacity } from 'react-native';

import { Search, ChevronRight, CloseBold } from '@oxygen/icons';
import { concatString } from '../utils/string';
import { testIdProps } from '../utils/testIdProps';
import CONSTANTS from '../constants/constant';

const propTypes = {
    /** If `true`, component will be focused on mount */
    autoFocus: PropTypes.bool,
    /** If `true`, button will appear on if input has any value */
    clearButton: PropTypes.bool,
    /** If `true`, the input will be disabled. */
    disabled: PropTypes.bool,
    /** Ref to inner elements */
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({ current: PropTypes.any }),
    ]),
    /** Icon position */
    iconPosition: PropTypes.oneOf(['left', 'right']),
    /** Show / hide loading icon. */
    isLoading: PropTypes.bool,
    /** Icon for the component */
    inputIcon: PropTypes.oneOf(['search', 'arrow', 'none', 'close']),
    /** Determines which keyboard to open */
    keyboardType: PropTypes.oneOf(['default', 'number-pad', 'email-address']),
    /** A custom text for label. */
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    /** If `true`, tag input will render. */
    multiple: PropTypes.bool,
    /** Callback fired when input is blurred. */
    onBlur: PropTypes.func,
    /** Callback fired when the value is changed. */
    onChange: PropTypes.func,
    /** Callback fired when input is focused. */
    onFocus: PropTypes.func,
    /** Callback fired on search or arrow is clicked */
    onIconPress: PropTypes.func,
    /** The short hint displayed in the input before the user enters a value. */
    placeholder: PropTypes.string,
    /** The prefix text/icon for the `Input`. */
    prefix: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    /** Style for input prefix. */
    prefixStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Specify an input field as read-only. */
    readOnly: PropTypes.bool,
    /** value for tag, Tag will appear if there is `selected` props. Please refer tag component for this. */
    selected: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string,
            handleClick: PropTypes.func,
        })
    ),
    /** Size of the Loader. */
    size: PropTypes.oneOf(['sm', 'lg']),
    /** Style for input. */
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** The suffix text/icon for the `Input`. */
    suffix: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    /** Style for input prefix. */
    suffixStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** The value of the `input` element. */
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
    /** will show scrollview of 60% width for tag input. scrollview will be disabled for user scrolling */
    showScroller: PropTypes.bool,
    /** Custom styles for the autocompleteInput wrapper */
    autocompleteInputWrapperStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
    ]),
};

const defaultProps = {
    autoFocus: false,
    clearButton: false,
    disabled: false,
    iconPosition: 'left',
    inputIcon: 'none',
    keyboardType: 'default',
    label: 'Clear',
    multiple: false,
    placeholder: 'Search',
    readOnly: false,
    size: 'sm',
    'data-testing-id': '',
    showScroller: false,
    autocompleteInputWrapperStyle: null,
};

const styles = StyleSheet.create({
    suffixTextContainer: {
        height: theme.size['full'],
        width: theme.size['auto'],
        paddingRight: theme.space[4],
        paddingLeft: theme.space[4],
        justifyContent: 'center',
    },
    suffixTextContainerNoRightPadding: {
        paddingRight: theme.space[0],
    },
    suffixText: {
        color: theme.color['accent-800'],
        fontSize: theme.fontSize['7.5'],
    },
    suffix: {
        paddingLeft: theme.space[0],
        paddingRight: theme.space[0],
        height: theme.size['full'],
    },
    iconContainer: {
        height: '100%',
        justifyContent: 'center',
    },
    iconContainerWithPadding: {
        paddingLeft: theme.space[4],
        paddingRight: theme.space[4],
    },
    arrowIcon: {
        transform: [{ rotateY: '180deg' }],
    },
});

const renderButton = (text, onPress, noRightPadding, testingName) => {
    const suffixTextContainerStyle = [
        styles.suffixTextContainer,
        noRightPadding ? styles.suffixTextContainerNoRightPadding : null,
    ];
    return (
        <Pressable onPress={onPress}>
            <View
                {...testIdProps(
                    concatString(testingName, 'autocomplete-clear-button')
                )}
                style={suffixTextContainerStyle}
            >
                <Text style={styles.suffixText}>{text}</Text>
            </View>
        </Pressable>
    );
};

const getIcon = (inputIcon, onIconPress, testingName) => {
    const hitSlop = {
        top: CONSTANTS.AUTOCOMPLETE_ICON_HITSLOP,
        bottom: CONSTANTS.AUTOCOMPLETE_ICON_HITSLOP,
        left: CONSTANTS.AUTOCOMPLETE_ICON_HITSLOP,
        right: CONSTANTS.AUTOCOMPLETE_ICON_HITSLOP,
    };

    switch (inputIcon) {
        case 'search':
            return (
                <TouchableOpacity hitSlop={hitSlop} onPress={onIconPress}>
                    <Search
                        color={theme.color['neutral-900']}
                        {...testIdProps(
                            concatString(
                                testingName,
                                'autocomplete-search-button'
                            )
                        )}
                    />
                </TouchableOpacity>
            );
        case 'arrow':
            return (
                <TouchableOpacity hitSlop={hitSlop} onPress={onIconPress}>
                    <ChevronRight
                        style={styles.arrowIcon}
                        color={theme.color['neutral-900']}
                        size="xsm"
                        {...testIdProps(
                            concatString(
                                testingName,
                                'autocomplete-arrow-button'
                            )
                        )}
                    />
                </TouchableOpacity>
            );
        case 'close':
            return (
                <TouchableOpacity hitSlop={hitSlop} onPress={onIconPress}>
                    <CloseBold
                        color={theme.color['neutral-900']}
                        size="xsm"
                        {...testIdProps(
                            concatString(
                                testingName,
                                'autocomplete-close-button'
                            )
                        )}
                    />
                </TouchableOpacity>
            );
    }
};

const AutocompleteInput = ({
    isLoading,
    size,
    isPopup,
    suffix,
    suffixStyle,
    prefix,
    label,
    clearButton,
    onClear,
    iconPosition,
    inputIcon,
    onIconPress,
    'data-testing-id': testingName,
    autocompleteInputWrapperStyle,
    ...props
}) => {
    const inputsuffixStyle = [suffixStyle, styles.suffix];

    const iconPositionLeft =
        inputIcon !== 'none' ? iconPosition === 'left' : false;
    const iconPositionRight =
        inputIcon !== 'none' ? iconPosition === 'right' : false;

    // get icon
    const autocompleteIcon = getIcon(inputIcon, onIconPress, testingName);
    if (iconPositionRight) {
        props.suffix = (
            <View
                style={[
                    styles.iconContainer,
                    clearButton ? styles.iconContainerWithPadding : null,
                ]}
            >
                {autocompleteIcon}
            </View>
        );
    } else if (iconPositionLeft) {
        props.prefix = <View>{autocompleteIcon}</View>;
    }

    // get aux
    if (isLoading) {
        props.isLoading = true;
        props.size = isPopup && size === 'lg' ? 'lg' : 'sm';
    } else if (clearButton) {
        props.suffixStyle = inputsuffixStyle;
        props.suffix = (
            <>
                {renderButton(
                    label,
                    onClear || null,
                    iconPositionRight,
                    testingName
                )}
                {props.suffix}
            </>
        );
    } else if (suffix) {
        if (typeof suffix === 'string') {
            props.suffix = (
                <View style={inputsuffixStyle}>
                    <Text
                        data-testing-id={concatString(
                            testingName,
                            `suffix-${suffix}`
                        )}
                    >
                        {suffix}
                    </Text>
                </View>
            );
        } else {
            props.suffix = (
                <View
                    {...testIdProps(concatString(testingName, 'suffix'))}
                    style={inputsuffixStyle}
                >
                    {suffix}
                </View>
            );
        }
    }

    return autocompleteInputWrapperStyle ? (
        <View
            style={
                Array.isArray(autocompleteInputWrapperStyle)
                    ? autocompleteInputWrapperStyle
                    : [autocompleteInputWrapperStyle]
            }
        >
            <Input
                {...props}
                data-testing-id={concatString(testingName, 'autocomplete')}
            />
        </View>
    ) : (
        <Input
            {...props}
            data-testing-id={concatString(testingName, 'autocomplete')}
        />
    );
};

AutocompleteInput.propTypes = propTypes;
AutocompleteInput.defaultProps = defaultProps;

export default AutocompleteInput;
