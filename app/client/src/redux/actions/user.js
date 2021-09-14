import { USER_ACTION_TYPES } from '../constants/_constants';
import utils from 'util/_util';

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

function _setPreflightHash(preflightHash) {
    return { type: USER_ACTION_TYPES.SET_PREFLIGHT_HASH, payload: preflightHash }
}

//////////////////////////////////
/* External Async Action Calls */
/////////////////////////////////

/**
 * Sets and updates the redux=state user.prefightHash and stores to electron
 * Should only be called when user is setting a new password
 */
export function setAndStorePreflightHash(preflightHash) {
    _setPreflightHash(preflightHash); // Set the preflight hash to redux state
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
        // .. Asyncronous logic to lock account if needed
        // ...
        await utils.generic.waitFor(1000);
        dispatch(_lockAccount());
    }
}

export function unlockAccount() {
    return async function (dispatch) {
        // .. Asyncronous logic to unlock account if needed
        // ...
        await utils.generic.waitFor(1000);
        dispatch(_unlockAccount());
    }
}