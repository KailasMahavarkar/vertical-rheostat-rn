
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
};