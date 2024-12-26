import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, TouchableNativeFeedback } from 'react-native';
import theme from '../theme';
import { isAndroid } from '../constants';
import Animated from 'react-native-reanimated';

const propTypes = {
    /** Children for the component */
    children: PropTypes.node.isRequired,
    // Rest of the props are same as button component props
};
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(
    TouchableOpacity
);
const AnimatedTouchableNativeFeedback = Animated.createAnimatedComponent(
    TouchableNativeFeedback
);

const AnimatedRipple = ({ children, ...props }) => {
    const Component = !isAndroid
        ? AnimatedTouchableOpacity
        : AnimatedTouchableNativeFeedback;
    const buttonProps = { ...props };

    if (isAndroid) {
        buttonProps['background'] = Component.Ripple({
            color: theme.color['neutral-600'],
        });
        buttonProps['useForeground'] = true;
    }

    return <Component {...buttonProps}>{children}</Component>;
};

AnimatedRipple.propTypes = propTypes;
export default AnimatedRipple;
