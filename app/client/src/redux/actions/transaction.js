import { TRANSACTION_ACTION_TYPES } from '../constants/_constants';
import { transactionTypes } from 'util/_util';

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
 * Adds a value store
 * @param { Object } transaction - A value store
 * @returns null
 */
export function addValueStore(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.ADD_TO_LIST, payload: { ...transaction, type: transactionTypes.VALUE_STORE } });
    }
}

/**
 * Adds a data store
 * @param { Object } transaction - A data store
 * @returns null
 */
export function addDataStore(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.ADD_TO_LIST, payload: { ...transaction, type: transactionTypes.DATA_STORE } });
    }
}

