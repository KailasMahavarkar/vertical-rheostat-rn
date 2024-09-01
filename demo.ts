function getClosestIndex(array, target, leftIndex, rightIndex) {
    let left = leftIndex || 0;
    let right = rightIndex || array.length - 1;


    while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (array[mid] === target) {
            return {
                index: mid,
                value: array[mid],
            }
        }
        if (array[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // If the target is not found, find the closest index
    const closestIndex =
        Math.abs(array[left] - target) <
            Math.abs(array[right] - target)
            ? left
            : right;
    return {
        index: closestIndex,
        value: array[closestIndex],
    }
}

const snappingPercentage = [0, 6.25, 12.5, 25, 37.5, 100, 200];

console.log(
    getClosestIndex(snappingPercentage, 151, 0, 6),
)