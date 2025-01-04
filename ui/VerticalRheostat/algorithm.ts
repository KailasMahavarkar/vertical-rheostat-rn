export const linearAlgorithm = {
    getPosition(value, min, max) {
        return ((value - min) / (max - min)) * 100;
    },
    getValue(positionPercent, min, max) {
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
        const normalizedPosition = position / 100;
        const logMin = Math.log10(minRange + 1);
        const logMax = Math.log10(maxRange + 1);
        const logValue = logMin + normalizedPosition * (logMax - logMin);
        return Math.pow(10, logValue) - 1;
    },
    getPosition: (value, minRange, maxRange) => {
        const logMin = Math.log10(minRange + 1);
        const logMax = Math.log10(maxRange + 1);
        const logValue = Math.log10(value + 1);
        return ((logValue - logMin) / (logMax - logMin)) * 100;
    }
};
