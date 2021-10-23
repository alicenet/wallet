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
 * Adds a transaction to the list
 * @param { Object } transaction - It could be a data store or a value store
 * @returns null
 */
export function add(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.ADD_TO_LIST, payload: transaction });
    }
}
