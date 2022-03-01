import { MODAL_ACTION_TYPES } from '../constants/_constants';

/**
 * Opens the modal for renaming the specified wallet
 * @param { Object } walletTarget - Wallet state object from from redux state 
 * @returns { Function }
 */
export function openRenameWalletModal(walletTarget) {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.OPEN_RENAME_WALLET, payload: walletTarget });
    }
}

/** Inverse to the above -- Action will clear the wallet_action_target from state 
 * @returns { Function }
*/
export function closeRenameWalletModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_RENAME_WALLET });
    }
}

/**
 * Opens the modal for removing the specified wallet
 * @param { Object } walletTarget - Wallet state object from from redux state 
 * @returns { Function }
 */
export function openRemoveWalletModal(walletTarget) {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.OPEN_REMOVE_WALLET, payload: walletTarget });
    }
}

/** Inverse to the above -- Action will clear the wallet_action_target from state 
 * @returns { Function }
*/
export function closeRemoveWalletModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_REMOVE_WALLET });
    }
}

/**
 * Opens the modal for exportign the private key from the specified wallet
 * @param { Object } walletTarget - Wallet state object from from redux state 
 * @returns { Function }
 */
export function openXportPrivKModal(walletTarget) {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.OPEN_XPORT_PRIVK, payload: walletTarget });
    }
}

/** Inverse to the above -- Action will clear the wallet_action_target from state 
 * @returns { Function }
*/
export function closeExportPrivateKeyModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_XPORT_PRIVK });
    }
}

/**
 * Opens the modal for exporting the keystore for the specified wallet
 * @param { Object } walletTarget - Wallet state object from from redux state 
 * @returns { Function }
 */
export function openXportKeyStoreModal(walletTarget) {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.OPEN_XPORT_KS, payload: walletTarget });
    }
}

/** Inverse to the above -- Action will clear the wallet_action_target from state 
 * @returns { Function }
*/
export function closeExportKeyStoreModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_XPORT_KS });
    }
}

/**
 * Closes the modal for resetting the wallet
 * @returns { Function }
 */
export function closeResetWalletModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.CLOSE_RESET_WALLET });
    }
}

/**
 * Opens the modal for resetting the wallet
 * @returns { Function }
 */
export function openResetWalletModal() {
    return function (dispatch) {
        dispatch({ type: MODAL_ACTION_TYPES.OPEN_RESET_WALLET });
    }
}