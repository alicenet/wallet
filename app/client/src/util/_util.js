import * as generic from './generic';
import * as string from './string';
import * as wallet from './wallet';

const utils = {
    generic: generic,
    string: string,
    wallet: wallet,
}

// Quick exports
export const classNames = generic.classNames;

export default utils;