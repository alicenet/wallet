import log from 'loglevel';
import {v4 as uuidv4} from 'uuid';
import {splitStringWithEllipsis} from './string';

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
            for(const key in className) {
                if(className[key]) {
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

export const isDebug = () => {
    return process.env.REACT_APP_DEBUG
};