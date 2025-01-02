import { useDerivedValue, useSharedValue, withTiming, scrollTo } from "react-native-reanimated";

const SCROLL_ANIMATION_DURATION = 260;

const useUiScroll = ({ ref }) => {
	const scrollXValue = useSharedValue(0);
	const scrollYValue = useSharedValue(0);

	useDerivedValue(() => {
		scrollTo(ref, scrollXValue.value, 0, true);
	}, []);

	useDerivedValue(() => {
		scrollTo(ref, 0, scrollYValue.value, true);
	}, []);

	if (!ref) {
		return null;
	}

	return ({ yOffset, xOffset, duration = SCROLL_ANIMATION_DURATION }) => {
		if (xOffset) {
			scrollXValue.value = withTiming(xOffset, { duration });
		}
		if (yOffset) {
			scrollYValue.value = withTiming(yOffset, { duration });
		}
	};
};

export default useUiScroll;
