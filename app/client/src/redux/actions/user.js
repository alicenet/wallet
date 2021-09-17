import { USER_ACTION_TYPES } from '../constants/_constants';
import utils from 'util/_util';
import { curveTypes } from 'util/wallet';
import { default_log as log } from 'log/logHelper';

///////////////////////////
/* Internal Action Calls */
///////////////////////////

/* Enable lock on user's account */
function _lockAccount() {
    return { type: USER_ACTION_TYPES.MARK_ACCOUNT_LOCKED };
}

/* Disable lock on user's account */
function _unlockAccount() {
    return { type: USER_ACTION_TYPES.MARK_ACCOUNT_UNLOCKED };
}

//////////////////////////////////
/* External Async Action Calls */
/////////////////////////////////

/**
 * Sets a new mnemonic to potential_seed_phrase for HD Wallet / Vault generation 
 * @returns null
 */
export function setNewPotentialMnemonic() {
    return async function (dispatch) {
        let phrase = utils.wallet.generateBip39Mnemonic();
        dispatch(setExistingMnemonic(phrase));
    }
}

/**
 * Sets an existing mnemonic for HD Wallet / Vault generation
 * @param { String } phrase - a mnemonic to potential_seed_phrase
 * @returns null
 */
export function setExistingMnemonic(phrase) {
    if (typeof phrase !== "string") {
        try {
            phrase = phrase.join(" ");
        } catch (ex) {
            log.error("Unable to parse passed parameter to string. Seed Phrase must be passed as string or simple array!")
        }
    }
    return async function (dispatch) {
        dispatch({ type: USER_ACTION_TYPES.SET_POTENTIAL_SEED_PHRASE, payload: phrase });
    }
}

/**
 * Clears mnemonic / Vault generation
 * @returns null
 */
export function clearMnemonic() {
    return async function (dispatch) {
        dispatch(setExistingMnemonic(''));
    }
}

/**
 * @param { String } curveType - One of utils.curveTypes 
 * @returns 
 */
export function setDesiredCurveType(curveType) {
    return async function (dispatch) {
        if (curveType !== curveTypes.SECP256K1 && curveType !== curveTypes.BARRETO_NAEHRIG) {
            throw new Error("Attempting to dispatch setDesiredCurveType with invalid curve type. Use utils.curveTypes! ")
        }
        dispatch({ type: USER_ACTION_TYPES.SET_DESIRED_HD_CURVE, payload: curveType });
    }
}

/* Check for existing user account files and set state accordingly */
export function checkForUserAccount() {
    return async function (dispatch) {
        // Check for account...

        // If exists...
        loadUserAccount();
    }
}

export function loadUserAccount() {
    return async function (dispatch) {
        console.log("Loading user account");
    }
}

export function lockAccount() {
    return async function (dispatch) {
        // .. Asynchronous logic to lock account if needed
        // ... TBD: Remove state from store and require a new unlock cycle with deciphering
        await utils.generic.waitFor(1000);
        dispatch(_lockAccount());
    }
}

export function unlockAccount() {
    return async function (dispatch) {
        // .. Asynchronous logic to unlock account if needed
        // ... Decipher store back into redux state
        await utils.generic.waitFor(1000);
        dispatch(_unlockAccount());
    }
}