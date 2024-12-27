import { useCallback } from 'react';
import {
    scrollTo,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

/**
 * Duration of scroll animations in milliseconds.
 */
const SCROLL_ANIMATION_DURATION = 260;

/**
 * Custom hook for handling scroll animations using react-native-reanimated.
 *
 * @param ref is ref of AnimatedRef<T> type.
 * @returns handleScroll - the handleScroll function, which performs scrolling on Ui Thread.
 */

const useUiScroll = ({ ref }) => {
    const scrollXValue = useSharedValue(0);
    const scrollYValue = useSharedValue(0);

    if (!ref) return null;

    useDerivedValue(() => {
        scrollTo(ref, scrollXValue.value, 0, true);
    }, []);

    useDerivedValue(() => {
        scrollTo(ref, 0, scrollYValue.value, true);
    }, []);

    const handleXDirectionScroll = useCallback((xOffset, duration) => {
        scrollXValue.value = withTiming(xOffset, {
            duration,
        });
    }, []);

    const handleYDirectionScroll = useCallback((yOffset, duration) => {
        scrollYValue.value = withTiming(yOffset, {
            duration,
        });
    }, []);

    const handleScroll = useCallback(
        ({ yOffset, xOffset, duration = SCROLL_ANIMATION_DURATION }) => {
            if (!!xOffset) handleXDirectionScroll(xOffset, duration);
            if (!!yOffset) handleYDirectionScroll(yOffset, duration);
        },
        [handleXDirectionScroll, handleYDirectionScroll]
    );

    return handleScroll;
};

export default useUiScroll;
