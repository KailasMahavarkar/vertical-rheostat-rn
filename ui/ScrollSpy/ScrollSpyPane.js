import React from 'react';
import PropTypes from 'prop-types';
import { View } from 'react-native';

const propTypes = {
    /** Custom style for the component */
    style: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    /** Children for the component */
    children: PropTypes.node.isRequired,
    /** The tab description for the component. It should be a type of string. */
    description: function(props, propName, componentName) {
        if (
            typeof props.title === 'object' &&
            (!props.description || typeof props.description !== 'string')
        ) {
            return new Error(
                'Invalid prop `' +
                    propName +
                    '` of type `' +
                    typeof props.description +
                    '` supplied to ' +
                    componentName +
                    ', expected `string`.'
            );
        }
    },
    /** If `true`, then it is not clickable */
    disabled: PropTypes.bool,
    /** Callback fired on tab is clicked */
    onTabClick: PropTypes.func,
    /** The sponsored text for the component. */
    sponsoredText: PropTypes.string,
    /** Change the sponsored badge color for the component. */
    sponsoredBgColor: PropTypes.oneOf(['teal', 'brown', 'blue', 'red', 'gray']),
    /** The tab title for the component. */
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

const defaultProps = {
    style: null,
    sponsoredBgColor: 'gray',
};

const ScrollSpyPane = ({ children, style }) => {
    return <View style={style}>{children}</View>;
};

ScrollSpyPane.propTypes = propTypes;
ScrollSpyPane.defaultProps = defaultProps;
ScrollSpyPane.displayName = 'ScrollSpyPane';

export default ScrollSpyPane;
