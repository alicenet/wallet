import log from 'loglevel';
import { v4 as uuidv4 } from 'uuid';
import { splitStringWithEllipsis } from './string';

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

export const isDebug = () => { return process.env.REACT_APP_DEBUG };

console.log(process.env);