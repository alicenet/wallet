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
 * https://github.com/neosiae/is-valid-http-url
 * @param {string} url - Url to test
 * @return Returns true if the string is a valid HTTP URL
 */
export function isValidHttpUrl(url) {
    const protocol = '(?:(?:https?)://)';
    const ipv4 = '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))';
    const hostname = '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)';
    const domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
    const tld = '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))';
    const port = '(?::\\d{2,5})?';
    const resourcePath = '(?:[/?#]\\S*)?';
    const regex = `${protocol}(?:localhost|${ipv4}|${hostname}${domain}${tld}\\.?)${port}${resourcePath}`;
    const isUrl = new RegExp(`^${regex}$`, 'i');

    return isUrl.test(url);
}