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

////////////////////////////////////////////////////////////////////////////////////////
/* External Async Action Calls -- Require forwarded dispatch from connected component */
////////////////////////////////////////////////////////////////////////////////////////

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