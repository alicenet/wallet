import { MODAL_ACTION_TYPES } from '../constants/_constants';

/**
 * Pop open global error modal with a message
 * @param { String } msg - Message to show within the error modal 
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function openGlobalErrorModal(msg) {
    return { type: MODAL_ACTION_TYPES.SET_GLOBAL_ERROR, payload: msg }
}

/**
 * Close the global error modal and clear any message state within it
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function clearGlobalErrorModal() {
    return { type: MODAL_ACTION_TYPES.CLEAR_GLOBAL_ERROR }
}