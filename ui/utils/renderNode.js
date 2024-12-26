import React from 'react';
import Text from '../Text';

export const renderNode = (element, props) => {
    return typeof element === 'string' ? (
        <Text {...props}>{element}</Text>
    ) : (
        element
    );
};
