import React from 'react';
import { Text as NativeText, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import theme from '../theme';
import { testIdProps } from '../utils/testIdProps';
import { concatString } from '../utils/string';

const propTypes = {
    /** Text to be displayed inside the `Text` component */
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
        .isRequired,
    /** Custom styles for the `Text` component */
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
    fontFamily: {
        fontFamily: theme.fontFamily.regular,
    },
});

const defaultProps = {
    style: null,
};
function Text(props) {
    const {
        children,
        style,
        'data-testing-id': testingName,
        ...otherProps
    } = props;
    return (
        <NativeText
            style={[styles.fontFamily, style]}
            {...testIdProps(concatString(testingName, 'text'))}
            {...otherProps}
        >
            {children}
        </NativeText>
    );
}

Text.defaultProps = defaultProps;
Text.propTypes = propTypes;
Text.displayName = 'Text';

export default Text;
