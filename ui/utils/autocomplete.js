import escapeStringRegexp from 'escape-string-regexp';

const CASE_INSENSITIVE = 'i';
const COMBINING_MARKS = /[\u0300-\u036F]/;

export const getMatchBounds = (subject, str) => {
    const search = new RegExp(escapeStringRegexp(str), CASE_INSENSITIVE);

    const matches = search.exec(subject);

    if (!matches) {
        return null;
    }

    let start = matches.index;
    let matchLength = matches[0].length;

    // Account for combining marks, which changes the indices.
    if (COMBINING_MARKS.test(subject)) {
        // Starting at the beginning of the subject string, check for the number of
        // combining marks and increment the start index whenever one is found.
        for (let ii = 0; ii <= start; ii++) {
            if (COMBINING_MARKS.test(subject[ii])) {
                start += 1;
            }
        }

        // Similarly, increment the length of the match string if it contains a
        // combining mark.
        for (let ii = start; ii <= start + matchLength; ii++) {
            if (COMBINING_MARKS.test(subject[ii])) {
                matchLength += 1;
            }
        }
    }

    return {
        end: start + matchLength,
        start,
    };
};

export const getOptionLabel = (option, labelKey) => {
    if (option.paginationOption || option.customOption) {
        return option[typeof labelKey === 'string' ? labelKey : 'label'];
    }

    let optionLabel;

    if (typeof option === 'string') {
        optionLabel = option;
    }
    if (typeof labelKey === 'function') {
        // This overwrites string options, but we assume the consumer wants to do
        // something custom if `labelKey` is a function.
        optionLabel = labelKey(option);
    } else if (
        typeof labelKey === 'string' &&
        typeof option == 'object' &&
        Object.getPrototypeOf(option) == Object.prototype
    ) {
        optionLabel = option[labelKey];
    }

    return optionLabel;
};
