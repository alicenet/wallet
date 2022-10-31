import { upperFirst } from "lodash";
import { curveTypes } from "./wallet";
import Web3 from "web3";

/**
 * Displays an address with the right prefix based on the curve type
 * @param {string} address - String to split
 * @param {number} curve - Curve type
 */
export function addCurvePrefix(address, curve = curveTypes.SECP256K1) {
    if (!address) {
        return null;
    }
    return `${curve === curveTypes.SECP256K1 ? "0x" : "BN0x"}${removeHexPrefix(
        address
    )}`;
}

/**
 * Returns true if the string is a BN address
 * @param {string} address - String to split
 * @returns Returns true if the address contains the BN prefix
 */
export function isBNAddress(address) {
    if (typeof address !== "string") {
        return false;
    }
    if (!Web3.utils.isAddress(removeBNPrefix(removeHexPrefix(address)))) {
        return false;
    }
    return address.indexOf("BN") === 0;
}

/**
 * Splits a string with an ellipses, leaving designated length on both sides
 * @param {string} str - String to split
 * @param {int} lengthOnSides - How many characters to leave on sides of the ellipses
 */
export function splitStringWithEllipsis(str, lengthOnSides = 3) {
    if (typeof str !== "string") {
        return "";
    }
    return (
        str.slice(0, lengthOnSides) +
        "..." +
        str.slice(str.length - lengthOnSides, str.length)
    );
}

/**
 * Removes the Hex prefix
 * @param { String } address
 * @returns Returns the address
 */
export function removeHexPrefix(address) {
    if (address.indexOf("0x") >= 0) {
        return address.slice(2);
    }
    return address;
}

/**
 * Removes the BN prefix
 * @param { String } address
 * @returns Returns the address
 */
export function removeBNPrefix(address) {
    if (address.indexOf("BN") >= 0) {
        return address.slice(2);
    }
    return address;
}

/**
 * Return true of passed string resembles an expected TxHash
 * @param { String } hash
 * @returns { Boolean }
 */
export function isTxHash(hash) {
    return /^([A-Fa-f0-9]{64})$/.test(hash);
}

/**
 * Take a string with underscores as spaces as prettify it
 * @param input - String to prettify
 * @returns { String }
 */
export function prettifyUnderscoreKey(input) {
    let keyString = input.split("_");
    let keyWords = keyString.map((word) => upperFirst(word));
    return keyWords.join(" ");
}

/**
 * Pluralize a string based on a passed boolean parameter
 * @param { String } string - The string to pluralize
 * @param { Boolean } isPluralBool - Supply the boolean condition to determine if the string should have an 's' appended
 */
export function pluralStringCheck(string, isPluralBool) {
    return isPluralBool ? string + "s" : string;
}
