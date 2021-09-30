import { USER_ACTION_TYPES } from '../constants/_constants';
import { VAULT_ACTION_TYPES } from '../constants/_constants';
import utils from 'util/_util';
import { curveTypes } from 'util/wallet';
import { default_log as log } from 'log/logHelper';
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
 *  Check for existing user account files and set state accordingly -- 
 * @param { Boolean } initialCheck -- Is this the first check? First check will mark any found vault as locked -- if not, it will be left where redux state has determined.
 * @returns { {vault: Boolean, optOut: Boolean} } - Vault/Optout status
 */
export function checkForUserAccount(initialCheck) {
    return async function (dispatch) {
        let vaultExists = await electronStoreCommonActions.checkIfUserHasVault();
        if (vaultExists) {
            dispatch({ type: initialCheck ? VAULT_ACTION_TYPES.MARK_EXISTS_AND_LOCKED : VAULT_ACTION_TYPES.MARK_EXISTS });
            return { vault: true, optOut: false };
        } else {
            // CAT TODO: Check for keystore paths if no vault
            return false
        }
    }
}