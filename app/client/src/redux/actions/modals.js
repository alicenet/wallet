import { MODAL_ACTION_TYPES } from '../constants/_constants';

function _setGlobalErrorModal(msg) {
    return { type: MODAL_ACTION_TYPES.SET_GLOBAL_ERROR, payload: msg }
}

function _clearGlobalErrorModal() {
    return { type: MODAL_ACTION_TYPES.CLEAR_GLOBAL_ERROR }
}

export function openGlobalErrorModal(msg) {
    return (dispatch) => {
        dispatch(_setGlobalErrorModal(msg));
    }
}

export function clearGlobalErrorModal() {
    return (dispatch) => {
        dispatch(_clearGlobalErrorModal());
    }
}