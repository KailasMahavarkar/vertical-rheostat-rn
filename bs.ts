const panes = [
    [
        '0',
        {
            'height': 499.80950927734375,
            'width': 409.1428527832031,
            'x': 0,
            'y': 45.33333206176758,
        },
    ],
    [
        '1',
        {
            'height': 500.19049072265625,
            'width': 409.1428527832031,
            'x': 0,
            'y': 545.5238037109375,
        },
    ],
    [
        '2',
        {
            'height': 499.80950927734375,
            'width': 409.1428527832031,
            'x': 0,
            'y': 1045.3333740234375,
        },
    ],
    [
        '3',
        {
            'height': 500.19049072265625,
            'width': 409.1428527832031,
            'x': 0,
            'y': 1545.5238037109375,
        },
    ],
    [
        '4',
        {
            'height': 499.80950927734375,
            'width': 409.1428527832031,
            'x': 0,
            'y': 2045.3333740234375,
        },
    ],
    [
        '5',
        {
            'height': 500.19049072265625,
            'width': 409.1428527832031,
            'x': 0,
            'y': 2545.52392578125,
        },
    ],
    [
        '6',
        {
            'height': 499.80950927734375,
            'width': 409.1428527832031,
            'x': 0,
            'y': 3045.333251953125,
        },
    ],
];

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
        value: leftDiff < rightDiff ? leftValue : rightValue,
    };
}


// const panePoints = panes.map((x) => Number(Number(x[1].y).toFixed(0)));
// const ci = getClosestIndex(panePoints, 296);
// console.log("closest index -->", ci);
// console.log("panePoints --> ", panePoints);

function getTooltipLabels(topValue = 0, bottomValue = 0, tooltipTopTextSuffix = '', tooltipBottomTextSuffix = '', maxRange = 0) {
    let tooltipTopLen = tooltipTopTextSuffix.length;
    let tooltipBottomLen = tooltipBottomTextSuffix.length;

    let topSpaceCount = 0;
    let bottomSpaceCount = 0;

    const lenDiff = Math.max(0, Math.abs(tooltipTopLen - tooltipBottomLen));
    if (tooltipTopLen < tooltipBottomLen) {
        topSpaceCount += lenDiff;
        tooltipTopTextSuffix += '0'.repeat(lenDiff);
    } else {
        bottomSpaceCount += lenDiff;
        tooltipBottomTextSuffix += '0'.repeat(lenDiff);
    }

    const maxRangeLen = maxRange.toString().length;
    const topLenDiff = Math.max(0, maxRangeLen - topValue.toString().length);
    const bottomLenDiff = Math.max(0, maxRangeLen - bottomValue.toString().length);

    topSpaceCount += topLenDiff;
    bottomSpaceCount += bottomLenDiff;

    const topLabelText = `${topValue} ${tooltipBottomTextSuffix}`;
    const bottomLabelText = `${bottomValue} ${tooltipBottomTextSuffix}`;

    return {
        topLabelSpaceCount: topSpaceCount,
        bottomLabelSpacesCount: bottomSpaceCount,
        topLabelText,
        bottomLabelText,
    };
}

const topValue = 100;
const bottomValue = 50000;
const maxRange = 100000;

let tooltipTopTextSuffix = " cro";
let tooltipBottomTextSuffix = " lakh";

const { topLabelText, bottomLabelText } = getTooltipLabels(
    topValue,
    bottomValue,
    tooltipTopTextSuffix,
    tooltipBottomTextSuffix,
    maxRange,
);

console.log(`__${topLabelText}__`);
console.log(`__${bottomLabelText}__`);
