import { linearAlgorithm } from './algorithm';

// Convert the offset(distance) to a percentage
export const offsetToPercentage = (rheostatSize, offset) => {
    return (Math.abs(offset) / rheostatSize) * 100;
};

// Convert the percentage to a rheostat size
export const percentToRheostatSize = (rheostatSize, percent) => {
    return Math.max(0, (rheostatSize * percent) / 100);
};

// Clamp the value between the min and max
export const clampRange = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

// Convert the offset to a rheostat size
export const offsetToRheostatSize = (rheostatSize, offset) => {
    return percentToRheostatSize(rheostatSize, offsetToPercentage(rheostatSize, offset));
};

export function jslog(...args) {
    console.log(JSON.stringify(args, null, 2));
}

export const floatToInt = (value) => {
    return parseInt(value, 10);
};

export const tintColor = (color = '', percent = 10) => {
    // Convert hex to RGB
    let r = parseInt(color.substring(1, 3), 16);
    let g = parseInt(color.substring(3, 5), 16);
    let b = parseInt(color.substring(5, 7), 16);

    // Calculate new RGB values
    r = Math.round(r + ((255 - r) * percent) / 100);
    g = Math.round(g + ((255 - g) * percent) / 100);
    b = Math.round(b + ((255 - b) * percent) / 100);

    // Convert RGB back to hex
    const newColor =
        '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

    return newColor;
};


export const checkAlgorithm = (minRange = 0, maxRange = 1000, algorithm = linearAlgorithm, snapPoints = []) => {
    const tolerance = 0.0001;
    let allTestsPassed = true;

    snapPoints.forEach(({ value }) => {
        const position = algorithm.getPosition(value, minRange, maxRange);
        const calculatedValue = algorithm.getValue(position, minRange, maxRange);
        const isWithinTolerance = Math.abs(calculatedValue - value) < tolerance;

        if (isWithinTolerance) {
            console.log(`Test Passed for value: ${value} with range [${minRange}, ${maxRange}]`);
        } else {
            console.error(`Test Failed for value: ${value} with range [${minRange}, ${maxRange}]`);
            console.error(`Expected: ${value}, but got: ${calculatedValue}`);
            allTestsPassed = false;
        }
    });

    return allTestsPassed;
};


export function getClosestIndex(array, target) {
    if (array.length === 0) {
        return { index: -1, value: 0 };
    }

    let left = 0;
    let right = array.length - 1;

    if (target <= array[0]) {
        return { index: 0, value: array[0] };
    }
    if (target >= array[array.length - 1]) {
        return { index: array.length - 1, value: array[array.length - 1] };
    }

    // Binary search to find the closest value
    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (array[mid] === target) {
            return {
                index: mid,
                value: array[mid],
            };
        }

        if (array[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    const leftValue = array[left];
    const rightValue = array[right];

    const leftDiff = Math.abs(leftValue - target);
    const rightDiff = Math.abs(rightValue - target);

    return {
        index: leftDiff < rightDiff ? left : right,
        value: leftDiff < rightDiff ? leftValue : rightValue
    };
}