import log from 'loglevel';
import { v4 as uuidv4 } from 'uuid';
import { splitStringWithEllipsis } from './string';

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
    let timeoutID = splitStringWithEllipsis(uuidv4(), false, 3);
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

export const isDebug = process.env.REACT_APP_DEBUG === "TRUE";