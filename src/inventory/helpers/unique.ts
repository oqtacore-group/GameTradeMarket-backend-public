export function getUniqueArr(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()];
}