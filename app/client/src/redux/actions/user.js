import { USER_ACTION_TYPES } from '../constants/_constants';
import { VAULT_ACTION_TYPES } from '../constants/_constants';
import utils from 'util/_util';
import { curveTypes } from 'util/wallet';
import { reduxState_logger as log } from 'log/logHelper';
import { electronStoreCommonActions } from 'store/electronStoreHelper';

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

/**
 * This is the initial user account check for setting initial state.
 * Once ran once, we prevent it from dispatching again via checking for state first
 * @returns 
 */
export function initialUserAccountCheck() {
    return async function (dispatch, getState) {
        const vaultState = getState().vault;
        // If initial state has been determined, these dispatches should not occur again
        if (vaultState.is_locked !== null || vaultState.exists !== null) {
            return log.warn("Attempting to run initialUserAccountCheck() again. Why? Isolate and remove duplicate calls to this function. ONLY IN DEBUG IS THIS NORMAL :: Opening debug will generate this warning.\n\nENV DEBUG MODE : " + utils.generic.isDebug);
        }
        // Initial Check . . . 
        let vaultExists = await electronStoreCommonActions.checkIfUserHasVault();
        let optOutExists = await electronStoreCommonActions.checkForOptoutStores();
        if (vaultExists) {
            log.debug("Vault exists! Setting state to match.");
            dispatch({ type: VAULT_ACTION_TYPES.MARK_EXISTS_AND_LOCKED });
            return { vault: true, optOut: false };
        } else if (optOutExists) { // Check for opt out
            log.debug("Optout collection exists! Setting state to match.");
            dispatch({ type: VAULT_ACTION_TYPES.MARK_OPTOUT__VAULT_NONEXIST_AND_UNLOCKED });
            return { vault: false, optOut: true };
        } else { // Else set clear state
            log.debug("Neither vault or optout collections exists! Setting state to match.");
            dispatch({ type: VAULT_ACTION_TYPES.MARK_NONEXIST_NONLOCK_NONOPTOUT });
            return { vault: false, optOut: false };
        }
    }
}