export const concatString = (prefix, suffix = '', infix = '-') => {
    if (prefix) {
        const concatedString = `${prefix} ${suffix}`;
        return concatedString.trim().replace(/\s+/g, infix);
    }
    return null;
};
