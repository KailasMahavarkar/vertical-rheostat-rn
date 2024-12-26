import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import theme from '../theme';

import Text from '../Text';
import { getMatchBounds } from '../utils/autocomplete';

const styles = StyleSheet.create({
    heightlighter: {
        fontFamily: theme.fontFamily.bold,
        color: theme.color['neutral-1000'],
        backgroundColor: theme.color['misc-100'],
    },
    normalText: {
        color: theme.color['neutral-1000'],
    },
});

/**
 * Stripped-down version of https://github.com/helior/react-highlighter
 *
 * Results are already filtered by the time the component is used internally so
 * we can safely ignore case and diacritical marks for the purposes of matching.
 */

const renderHighlightedChildren = ({ search, text }) => {
    const children = [];
    let _count = 0;
    let remaining = text;

    while (remaining) {
        const bounds = getMatchBounds(remaining, search);

        if (!bounds) {
            _count += 1;
            children.push(
                <Text style={styles.normalText} key={_count}>
                    {remaining}
                </Text>
            );
            return children;
        }

        // Capture the string that leads up to a match...
        const nonMatch = remaining.slice(0, bounds.start);
        if (nonMatch) {
            _count += 1;
            children.push(
                <Text style={styles.normalText} key={_count}>
                    {nonMatch}
                </Text>
            );
        }

        // Now, capture the matching string...
        const match = remaining.slice(bounds.start, bounds.end);
        if (match) {
            _count += 1;
            children.push(
                <Text style={styles.heightlighter} key={_count}>
                    {match}
                </Text>
            );
        }

        // And if there's anything left over, continue the loop.
        remaining = remaining.slice(bounds.end);
    }

    return children;
};

const Highlighter = ({ style, ...props }) => (
    <Text style={style}>
        {props.search ? renderHighlightedChildren(props) : props.children}
    </Text>
);

Highlighter.propTypes = {
    /** Children for the Component */
    children: PropTypes.string.isRequired,
    /** Search key for the Component */
    search: PropTypes.string.isRequired,
    /** Text to search in */
    text: PropTypes.string.isRequired,
};

export default Highlighter;
