import * as generic from './generic';
import * as string from './string';
import * as transaction from './transaction';
import * as wallet from './wallet';

const utils = {
    generic: generic,
    string: string,
    transaction: transaction,
    wallet: wallet,
}

// Quick exports
export const classNames = generic.classNames;
export const curveTypes = wallet.curveTypes;
export const transactionTypes = transaction.transactionTypes;
export const transactionStatus = transaction.transactionStatus;

// Util module exports
export const genericUtils = generic;
export const stringUtils = string;
export const walletUtils = wallet;

export default utils;