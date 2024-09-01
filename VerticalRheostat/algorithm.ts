export const linearAlgorithm = {

    getPosition(value, min, max) {
        'worklet';
        return ((value - min) / (max - min)) * 100;
    },

    getValue(positionPercent, min, max) {
        'worklet';
        const decimal = positionPercent / 100;
        if (positionPercent === 0) {
            return min;
        }
        if (positionPercent === 100) {
            return max;
        }
        return Math.round(((max - min) * decimal) + min);
    },
}
export const log10Algorithm = {
    getValue: (position, minRange, maxRange) => {
        'worklet';
        // Normalize position from 0-100 to 0-1
        const normalizedPosition = position / 100;

        // Logarithmic scale calculations
        const logMin = Math.log10(minRange + 1);  // Use log10(min + 1) to avoid log10(0)
        const logMax = Math.log10(maxRange + 1);  // Use log10(max + 1) to avoid log10(0)

        // Calculate the logarithmic value for the normalized position
        const logValue = logMin + normalizedPosition * (logMax - logMin);

        // Convert back from log scale to the actual value
        return Math.pow(10, logValue) - 1;  // Subtract 1 to offset the +1 added above
    },
    getPosition: (value, minRange, maxRange) => {
        'worklet';
        // Convert value to log scale
        const logMin = Math.log10(minRange + 1);
        const logMax = Math.log10(maxRange + 1);
        const logValue = Math.log10(value + 1);  // Convert value to logarithmic scale

        // Normalize back to a position between 0-100
        return ((logValue - logMin) / (logMax - logMin)) * 100;
    }
};
