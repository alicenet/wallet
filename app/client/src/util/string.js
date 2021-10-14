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
