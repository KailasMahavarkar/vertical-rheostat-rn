import React, { useState } from 'react';
import {
    TouchableHighlight,
    Image as NativeImage,
    View,
    StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import theme from '../theme';
import { NO_CAR_IMAGE } from '../utils/icons';
import { concatString } from '../utils/string';
import { testIdProps } from '../utils/testIdProps';

const propTypes = {
    /** Aspect ratio of image */
    aspectRatio: PropTypes.oneOf(['21:9', '16:9', '4:3', '1:1', '']),
    /** Callback fired when the component is clicked */
    onPress: PropTypes.func,
    /** Alternate Image link if the image doesn't exist */
    placeholderSrc: PropTypes.string,
    /** Default Image if the image takes time to load pass image path in this string using require */
    defaultSrc: PropTypes.any,
    /** Image url */
    src: PropTypes.string,
    /** Value for data testing attribute. */
    'data-testing-id': PropTypes.string.isRequired,
};

const defaultProps = {
    src: '',
    placeholderSrc: NO_CAR_IMAGE,
    aspectRatio: '16:9',
    defaultSrc: require('./assets/no_cars_img.png'),
};

const ASPECT_RATIO = {
    '21:9': 21 / 9,
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '1:1': 1,
};

const styles = StyleSheet.create({
    container: {
        width: theme.size['full'],
    },
});

const Image = ({
    src,
    placeholderSrc,
    aspectRatio,
    onPress,
    defaultSrc,
    'data-testing-id': testingName,
    ...otherProps
}) => {
    const [hasSrc, setHasSrc] = useState(src.length > 0);

    const handleOnError = () => setHasSrc(false);

    const imageSrc = hasSrc ? src : placeholderSrc;

    const imageStyles = {
        aspectRatio: ASPECT_RATIO[aspectRatio],
    };

    const getImage = () => (
        <NativeImage
            style={imageStyles}
            source={{
                uri: imageSrc,
            }}
            resizeMode="contain"
            onError={handleOnError}
            defaultSource={defaultSrc}
            {...testIdProps(concatString(testingName, 'image'))}
        />
    );

    const getClickableImage = image => (
        <TouchableHighlight onPress={onPress}>{image}</TouchableHighlight>
    );

    const renderImage = !onPress ? getImage() : getClickableImage(getImage());

    return (
        <View style={styles.container} {...otherProps}>
            {renderImage}
        </View>
    );
};

Image.propTypes = propTypes;
Image.defaultProps = defaultProps;

export default Image;
