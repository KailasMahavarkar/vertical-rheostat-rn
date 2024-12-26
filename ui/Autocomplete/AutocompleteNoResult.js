import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import theme from '../theme';

import Text from '../Text';
import AutocompleteMenuItem from './AutocompleteMenuItem';

const propTypes = {
    /** Text for the component */
    message: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
    noResult: {
        fontFamily: theme.fontFamily.bold,
    },
});

const AutocompleteNoResult = props => {
    const { message, style } = props;

    const itemStyle = [styles.noResult, style];
    return (
        <AutocompleteMenuItem>
            <Text style={itemStyle}>{message}</Text>
        </AutocompleteMenuItem>
    );
};

AutocompleteNoResult.propTypes = propTypes;

export default AutocompleteNoResult;
