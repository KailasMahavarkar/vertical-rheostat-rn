import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { Time, Trending } from '@oxygen/icons';
import theme from '../theme';

import AutoComplete from './Autocomplete';
import AutoCompleteMenu from './AutocompleteMenu';
import AutocompleteMenuItem from './AutocompleteMenuItem';
import AutocompleteNoResult from './AutocompleteNoResult';
import Highlighter from './Highlighter';

import Text from '../Text';
import { concatString } from '../utils/string';
import { testIdProps } from '../utils/testIdProps';

const propTypes = {
    /** If `true`, component will be focused on mount */
    autoFocus: PropTypes.bool,
    /** Input text value of the component. */
    text: PropTypes.string,
    // input props
    /** Size of the component */
    size: PropTypes.oneOf(['lg', 'sm']),
    /** Icon for the component */
    inputIcon: PropTypes.oneOf(['search', 'arrow', 'none', 'close']),
    /** Icon position */
    iconPosition: PropTypes.oneOf(['left', 'right']),
    /** Component is disabled or not */
    disabled: PropTypes.bool,
    /** Content for Find Car Search */
    findCarSearch: PropTypes.array,
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
    /** Custom 'No result found' component */
    noResultComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
    /** Display no result message */
    noResultMessage: PropTypes.string,
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
    /** Content for Recently Viewed */
    recentlyViewed: PropTypes.array,
    /** Content for Trending Searches */
    trendingSearches: PropTypes.array,
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
    /** Callback function fired on click of result */
    onResultPress: PropTypes.func,
    /** Menu will be align according to available space */
    flip: PropTypes.bool,
    /** Custom input wrapper styles */
    inputWrapperStyle: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Margin top for menu-item wrapper */
    menuWrapperMarginTop: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]),
    /** Custom styles for the autocompleteInput wrapper */
    autocompleteInputWrapperStyle: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
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
    noResultComponent: AutocompleteNoResult,
    noResultMessage: 'No Result Found',
    menuWrapperMarginTop: 0,
    autocompleteInputWrapperStyle: null,
};

const styles = StyleSheet.create({
    sponsoredBadge: {
        backgroundColor: theme.backgroundColor['neutral-800'],
        color: theme.color['neutral-100'],
        padding: theme.space[0.5],
        fontSize: theme.fontSize[5],
        borderRadius: theme.borderRadius[2],
    },
    menuHeader: {
        borderTopWidth: theme.borderWidth[1],
        borderColor: theme.borderColor['neutral-400'],
        paddingTop: theme.space[4],
        fontSize: theme.fontSize[6],
        fontWeight: theme.fontWeight['bold'],
        color: theme.color['neutral-900'],
    },
});

const GlobalAutocomplete = ({
    renderMenu: renderMenuProp,
    findCarSearch,
    onResultPress,
    recentlyViewed,
    trendingSearches,
    renderMenuItemChildren,
    size,
    'data-testing-id': testingName,
    ...props
}) => {
    const renderSponsoredBadge = () => (
        <Text
            style={styles.sponsoredBadge}
            data-testing-id={concatString(
                testingName,
                'global-autocomplete-sponsored-badge'
            )}
        >
            Ad
        </Text>
    );

    const renderResults = (results, searchLabel) => (
        <View
            {...testIdProps(
                concatString(
                    testingName,
                    'global-autocomplete-search-result-menu'
                )
            )}
        >
            {searchLabel && (
                <AutoCompleteMenu.Header style={styles.menuHeader}>
                    {searchLabel}
                </AutoCompleteMenu.Header>
            )}
            {results.map(({ label, value, isFeatured, ...options }, index) => (
                <AutocompleteMenuItem
                    onPress={onResultPress}
                    data-label={label}
                    data-value={value}
                    key={label}
                    size={size}
                    position={index === 0 ? 0 : null}
                    rightContent={
                        isFeatured
                            ? 'Ad'
                            : value.indexOf('upcoming') !== -1
                            ? 'Coming Soon'
                            : null
                    }
                    data-testing-id={concatString(
                        testingName,
                        `global-autocomplete-search-result-${index}`
                    )}
                    {...options}
                >
                    <Highlighter search={props.text} text={label}>
                        {label}
                    </Highlighter>
                </AutocompleteMenuItem>
            ))}
        </View>
    );

    const renderRecentlyViewed = items => (
        <View
            {...testIdProps(
                concatString(
                    testingName,
                    'global-autocomplete-recently-viewed-menu'
                )
            )}
        >
            <AutoCompleteMenu.Header style={styles.menuHeader}>
                Recently Viewed
            </AutoCompleteMenu.Header>
            {items.map(
                (
                    { label, onPress, isFeatured, isUpcoming, ...options },
                    index
                ) => (
                    <AutocompleteMenuItem
                        onPress={onPress}
                        key={label}
                        icon={
                            isFeatured ? (
                                renderSponsoredBadge()
                            ) : (
                                <Time size="sm" />
                            )
                        }
                        size={size}
                        position={index === 0 ? 0 : null}
                        rightContent={isUpcoming ? 'Coming Soon' : null}
                        {...options}
                        data-testing-id={concatString(
                            testingName,
                            `global-autocomplete-recently-viewed-${index}`
                        )}
                    >
                        {label}
                    </AutocompleteMenuItem>
                )
            )}
        </View>
    );

    const renderTrendingSearches = items => (
        <View
            {...testIdProps(
                concatString(
                    testingName,
                    'global-autocomplete-trending-search-menu'
                )
            )}
        >
            <AutoCompleteMenu.Header style={styles.menuHeader}>
                Trending searches
            </AutoCompleteMenu.Header>
            {items.map(
                (
                    { label, onPress, isFeatured, isUpcoming, ...options },
                    index
                ) => (
                    <AutocompleteMenuItem
                        size={size}
                        onPress={onPress}
                        key={label}
                        {...options}
                        icon={
                            isFeatured ? (
                                renderSponsoredBadge()
                            ) : (
                                <Trending size="sm" />
                            )
                        }
                        position={index === 0 ? 0 : null}
                        rightContent={isUpcoming ? 'Coming Soon' : null}
                        data-testing-id={concatString(
                            testingName,
                            `global-autocomplete-trending-search-${index}`
                        )}
                    >
                        {label}
                    </AutocompleteMenuItem>
                )
            )}
        </View>
    );

    const renderFindCarSearch = items => (
        <View
            {...testIdProps(
                concatString(testingName, 'global-autocomplete-findcar-menu')
            )}
        >
            <AutoCompleteMenu.Header style={styles.menuHeader}>
                Find New Car
            </AutoCompleteMenu.Header>
            {items.map(
                (
                    { label, onPress, isFeatured, isUpcoming, ...options },
                    index
                ) => (
                    <AutocompleteMenuItem
                        onPress={onPress}
                        size={size}
                        key={label}
                        position={index === 0 ? 0 : null}
                        rightContent={
                            isUpcoming
                                ? 'Coming Soon'
                                : isFeatured
                                ? 'Ad'
                                : null
                        }
                        data-testing-id={concatString(
                            testingName,
                            `global-autocomplete-findcar-${index}`
                        )}
                        {...options}
                    >
                        {label}
                    </AutocompleteMenuItem>
                )
            )}
        </View>
    );

    const renderMenu = results => {
        const {
            labelKey,
            text,
            noResultComponent: NoResult,
            noResultMessage,
            searchLabel,
        } = props;

        const renderChildren = (option, idx) => (
            <>
                {results && renderResults(results, searchLabel)}
                {text.length > 0 && !results && noResultMessage && (
                    <NoResult message={noResultMessage} />
                )}
                {recentlyViewed && renderRecentlyViewed(recentlyViewed)}
                {trendingSearches && renderTrendingSearches(trendingSearches)}
                {findCarSearch && renderFindCarSearch(findCarSearch)}
            </>
        );

        const menuProps = {
            labelKey,
            text,
            size,
        };

        return (
            <AutoCompleteMenu
                {...menuProps}
                options={results}
                hasVerticalSpacing={false}
                renderMenuItemChildren={() => {
                    return null;
                }}
            >
                {renderChildren()}
            </AutoCompleteMenu>
        );
    };

    return (
        <AutoComplete
            renderMenu={renderMenu}
            size={size}
            data-testing-id={concatString(testingName, 'global')}
            {...props}
        />
    );
};

GlobalAutocomplete.propTypes = propTypes;
GlobalAutocomplete.defaultProps = defaultProps;

export default GlobalAutocomplete;
