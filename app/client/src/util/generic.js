import log from 'loglevel';
import { splitStringWithEllipsis } from './string';
import utils from './_util';

/**
 * Conditionally joins classNames together
 * @param classNames - an object per class name
 */
export const classNames = (...classNames) => {
    let classes = [];

    classNames.forEach(className => {
        if (!className) {
            return;
        }

        const classNameType = typeof className;
        if (classNameType === 'string') {
            classes.push(className);
        } else if (classNameType === 'object') {
            for (const key in className) {
                if (className[key]) {
                    classes.push(key)
                }
            }
        }
    })

    return classes.join(' ');
}

/**
 * Async promise waiter, used for artificial waiting
 * @param msLength - How long to wait in ms
 * @param callerId - Supply to assist in debugging, if you so desire
 */
export const waitFor = (msLength, callerId) => {
    let timeoutID = splitStringWithEllipsis(utils.generic.genUuidv4(), false, 3);
    log.debug(`Waiting for ${msLength}ms via util.generic.waitFor(${msLength}) with ID: ${timeoutID}` + (callerId ? `Caller: ${callerId}` : ""));
    return new Promise(res => {
        setTimeout(() => {
            res();
            log.debug(`${timeoutID} has been resolved.`)
        }, msLength)
    });
}

/**
 * Check if a string has json-like structures
 * @param {String} str - String to check 
 * @returns 
 */
export const stringHasJsonStructure = (str) => {
    if (typeof str !== 'string') return false;
    try {
        const result = JSON.parse(str);
        const type = Object.prototype.toString.call(result);
        return type === '[object Object]'
            || type === '[object Array]';
    } catch (err) {
        return false;
    }
}

/**
 * Attempt to parse json, return error if err occurs.
 * @param {String} str 
 * @returns { Object } - (err, jsonObj)
 */
export const safeJsonParse = (str) => {
    try {
        return [null, JSON.parse(str)];
    } catch (err) {
        return [err];
    }
}

/**
 * Take a hex string and try to parse to utf8
 * @param {*} hexString 
 * @returns 
 */
export function hexToUtf8Str(hexString) {
    let parsed = false;
    try {
        parsed = decodeURIComponent(
            hexString.replace(/\s+/g, '')
                .replace(/[0-9a-f]{2}/g, '%$&')
        );
    } catch (ex) {
        log.error(ex);
    }
    return parsed
}

/**
 * Safely return the input if it is not undefined, or return the fallback value
 * Useful for avoding issues with boolean equality checks
 * @param {*} input - The value to check for typeof undefined
 * @param {*} fallback  - If input === "undefined" this value with be returned
 */
export function useFallbackValueForUndefinedInput(input, fallback) {
    return typeof input === "undefined" ? fallback : input;
}

/**
 * Generate an RFC 4122 compliant v4uuid using window.crypto.getRandomValues
 * @returns {String} - A newly generated v4uuid
 */
export function genUuidv4() {
    let hex = window.crypto.getRandomValues(new Uint8Array(128 / 8)); // Or your crypto lib of choice -- Slice off the 0x if lib provides it.
    let bytes = Buffer.from(hex, 'hex');

    // Force byte 7 and 9 to unsigned and pad to 8 bits
    let byte7asBin = (bytes[6] >>> 0).toString(2).padStart(8, "0"); // Get byte 7 as binary
    let byte9asBin = (bytes[8] >>> 0).toString(2).padStart(8, "0"); // Get byte 9 as binary

    // Set High nibble of byte7 to 0100 | 0x04 //
    let byte7Bits = byte7asBin.split('');
    byte7Bits[0] = "0";
    byte7Bits[1] = "1";
    byte7Bits[2] = "0";
    byte7Bits[3] = "0";
    byte7asBin = byte7Bits.join("");

    // Set 2 most significant bits of byte9 to 10 //
    let byte9Bits = byte9asBin.split('');
    byte9Bits[0] = "1";
    byte9Bits[1] = "0";
    byte9asBin = byte9Bits.join("");

    // Inject new bytes //
    bytes[6] = parseInt(byte7asBin, 2); // Byte 7 inject
    bytes[8] = parseInt(byte9asBin, 2); // Byte 9 inject

    let finalHex = bytes.toString('hex');

    // Add hyphens for blocks of 8-4-4-4-12 before returning v4uuid
    let block1 = finalHex.slice(0, 8);
    let block2 = finalHex.slice(8, 12);
    let block3 = finalHex.slice(12, 16);
    let block4 = finalHex.slice(16, 20);
    let block5 = finalHex.slice(20, finalHex.length);
    let v4uuid = [block1, block2, block3, block4, block5].join("-").toLowerCase();

    return v4uuid;
}

/**
 * Copy text to the clipboard
 * @param { String } text - Text to copy to clipboard 
 */
export function copyToClipboard(text) {
    // Try easy way
    try {
        navigator.clipboard.writeText(text);
    } catch (ex) {
        console.warn("Unable to copy with navigator, attempting DOM copy")
        // Try new navigator way
        try {
            let dummyElement = document.createElement();
            document.body.appendChild(dummyElement);
            dummyElement.value = text;
            dummyElement.select();
            document.execCommand("copy");
            document.body.removeChild(dummyElement);
        } catch (ex) {
            console.error("Unable to copy string to clipboard")
            return { error: "Failed to copy text to clipboard" }
        }
    }
}

export const isDebug = process.env.REACT_APP_DEBUG === "TRUE";