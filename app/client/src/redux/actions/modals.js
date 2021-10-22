import { MODAL_ACTION_TYPES } from '../constants/_constants';

/**
 * Opens the modal for renaming the specified wallet
 * @param { Object } walletTarget - Wallet state object from from redux state 
 * @returns 
 */
export function openRenameWalletModal(walletTarget) {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.OPEN_RENAME_WALLET, payload: walletTarget });
    }
}

/** Inverse to the above -- Action will clear the wallet_action_target from state */
export function closeRenameWalletModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_RENAME_WALLET });
    }
}

/**
 * Opens the modal for removing the specified wallet
 * @param { Object } walletTarget - Wallet state object from from redux state 
 * @returns 
 */
export function openRemoveWalletModal(walletTarget) {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.OPEN_REMOVE_WALLET, payload: walletTarget });
    }
}

/** Inverse to the above -- Action will clear the wallet_action_target from state */
export function closeRemoveWalletModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_REMOVE_WALLET });
    }
}

/**
 * Opens the modal for exportign the private key from the specified wallet
 * @param { Object } walletTarget - Wallet state object from from redux state 
 * @returns 
 */
 export function openXportPrivKModal(walletTarget) {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.OPEN_XPORT_PRIVK, payload: walletTarget });
    }
}

/** Inverse to the above -- Action will clear the wallet_action_target from state */
export function closeXportPrivKModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_XPORT_PRIVK });
    }
}
