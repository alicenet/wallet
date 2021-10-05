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
export const curveTypes = wallet.curveTypes;

// Util module exports
export const genericUtils = generic;
export const stringUtils = string;
export const walletUtils = wallet;

export default utils;