import { TRANSACTION_ACTION_TYPES } from '../constants/_constants';
import { find } from 'lodash';

//////////////////////////////////
/* External Async Action Calls */
/////////////////////////////////

/**
 * Toggle loading status
 * @param { number } fee - The selected fee
 * @returns null
 */
export function setPrioritizationFee(fee) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_PRIORITIZATION_FEE, payload: fee });
    }
}

/**
 * Set the wallet object of the fee payer
 * @param { Object } wallet - Redux wallet state object
 * @param { Boolean } userOverride - Sets the override flag so that parseDefaultFeePayer() does not update the fee when called
 */
export function setFeePayer(wallet, over_ride = false) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_FEE_PAYER, payload: { wallet: wallet, over_ride: over_ride } });
    }
}

/**
 * Clears the Fee Payer -- Generally called post tx send
 * @returns 
 */
export function clearFeePayer() {
    return async function (dispatch) {
        dispatch({type: TRANSACTION_ACTION_TYPES.CLEAR_FEE_PAYER});
    }
}

/**
 * Parses txList and sets the default fee payer to position 0 of the list if it exists unless over_ride is set 
 * -- Generally called after changes to the transaction list have been made.
 */
export function parseDefaultFeePayer() {
    return async function (dispatch, getState) {
        const state = getState();
        const transactionList = state.transaction.list;
        const over_ride = state.transaction.feePayer.over_ride;

        // If the over_ride is set ( Manual Fee Payer Wallet Has Been Selected ), do not update through the parseDefaultFeePayer
        if (over_ride) { return }
        // Don't update the default if none exist
        if (transactionList.length === 0) { return }

        // Else, update to the first entry position 
        const wallets = [...state.vault.wallets.internal, ...state.vault.wallets.external]
        const firstEntry = transactionList[0];

        // Grab the wallet to set as the fee payer and dispatch it
        const walletToSet = wallets.filter(wallet => wallet.address === firstEntry.from)?.[0];
        dispatch(setFeePayer(walletToSet ? walletToSet : false));
    }
}

/**
 * Toggle loading status
 * @returns null
 */
export function toggleStatus() {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.TOGGLE_STATUS });
    }
}

/**
 * Saves the address chosen for the change to be returned to
 * @param { string } address - A valid Web3 address
 * @returns null
 */
export function saveChangeReturnAddress(address) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SAVE_CHANGE_RETURN_ADDRESS, payload: address });
    }
}

/**
 * Goes back to initialization details
 * @returns null
 */
export function clearList() {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_PRIORITIZATION_FEE, payload: 0 });
        dispatch({ type: TRANSACTION_ACTION_TYPES.CLEAR_LIST });
    }
}

/**
 * Adds a data/value store -- Additionally dispatches parse for default fee payer request
 * @param { Object } transaction - A data/value store
 * @returns null
 */
export function addStore(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.ADD_TO_LIST, payload: transaction });
        dispatch(parseDefaultFeePayer());
    }
}

/**
 * Edits a data/value store -- Additionally dispatches parse for default fee payer request
 * @param { Object } transaction - A data/value store
 * @returns null
 */
export function editStore(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.UPDATE_FROM_LIST, payload: transaction });
        dispatch(parseDefaultFeePayer());
    }
}

/**
 * Removes an item from the list
 * @param { int } index - Index of the element
 * @returns null
 */
export function removeItem(index) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.REMOVE_FROM_LIST, payload: index });
    }
}

export function setLastSentAndMinedTx(tx) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_LAST_SENT_MINED_TX, payload: tx });
    }
}

export function setLastSentTxHash(txHash) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_LAST_SENT_TX_HASH, payload: txHash });
    }
}

export function addPolledTx(tx) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.ADD_POLLED_TX, payload: tx });
    }
}

export function clearPolledTxs() {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.CLEAR_POLLED_TX });
    }
}