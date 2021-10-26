import { TRANSACTION_ACTION_TYPES } from '../constants/_constants';

//////////////////////////////////
/* External Async Action Calls */
/////////////////////////////////

/**
 * Clears the current list of transactions
 * @returns null
 */
export function clearList() {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.CLEAR_LIST });
    }
}

/**
 * Adds a data/value store
 * @param { Object } transaction - A data/value store
 * @returns null
 */
export function addStore(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.ADD_TO_LIST, payload: transaction });
    }
}

/**
 * Edits a data/value store
 * @param { Object } transaction - A data/value store
 * @returns null
 */
export function editStore(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.UPDATE_FROM_LIST, payload: transaction });
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
