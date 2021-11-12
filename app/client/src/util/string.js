import { upperFirst } from 'lodash';

/**
 * Limit string length to limit, return as full limit length, where length through length -3 are ellipses
 * @param {string} str
 * @param {int} limit
 * @return Returns limited string, or original string if limit is not greater than passed string length
 */
export function limitStringLength(str, limit) {
    return str.length > limit ? str.slice(0, limit - 3) + "..." : str
}

/**
 * Splits a string with an ellipses, leaving designated length on both sides
 * @param {string} str - String to split
 * @param {int} lengthOnSides - How many characters to leave on sides of the ellipses
 */
export function splitStringWithEllipsis(str, lengthOnSides = 3) {
    if (typeof str !== "string") {
        console.warn('Non string passed to splitStringWithEllipses(), returning "" ');
        return "";
    }
    return str.slice(0, lengthOnSides)
        + "..."
        + str.slice(str.length - lengthOnSides, str.length);
}

/**
 * Return true of passed string resembles an expected TxHash
 * @param { String } hash 
 * @returns 
 */
export function isTxHash(hash) {
    return /^([A-Fa-f0-9]{64})$/.test(hash);
}

/**
 * Take a string with underscores as spaces as prettify it
 * @param input - String to prettify
 * @returns { String } 
 */
export function prettyifyUnderscoreKey(input) {
    let keyString = input.split("_");
    let keyWords = keyString.map(word => (upperFirst(word)));
    return keyWords.join(" ");
}