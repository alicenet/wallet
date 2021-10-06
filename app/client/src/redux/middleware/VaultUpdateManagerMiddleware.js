import { toast } from 'react-toastify';
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import { MODAL_ACTION_TYPES } from 'redux/constants/_constants';
import { SyncToastMessageSuccess, SyncToastMessageWarning } from '../../Components/customToasts/CustomToasts';

export const ACTION_ELECTRON_SYNC = "ELECTRON_SYNC"

/**
 * Syncronoizes state between redux and the stored electron state
 * Catches all wallet updates and reflects them onto the electron store if the user has a vault
 * @param {*} storeAPI
 * @returns
 */
export default function VaultUpdateManagerMiddleware(storeAPI) {
    return function wrapDispatch(next) {
        return function handleAction(action) {
            let state = storeAPI.getState();
            if (state.vault.is_locked !== null && state.vault.exists !== null) { // Don't update on unknown vault states
                // Only sync on store sync actions
                if (action.type === ACTION_ELECTRON_SYNC) {
                    // Vault Syncing
                    if (state.vault.exists && !state.vault.is_locked) { // Only update electron store of an existing, unlocked vault
                        syncStateToStore(storeAPI, action.payload.reason);
                    }
                    // Optout Syncing
                    else if (state.vault.optout) { // Only update electron store of an existing, unlocked vault
                        syncOptoutStore(storeAPI, action.payload.reason, action.payload.keystoreAdded);
                    }
                }
            }
            // Do anything here: pass the action onwards with next(action),
            // or restart the pipeline with storeAPI.dispatch(action)
            // Can also use storeAPI.getState() here
            return next(action)
        }
    }
}

function _getStateWallets(storeAPI) {
    let wallets = storeAPI.getState().vault.wallets;
    let walletStorage = { internal: [], external: [] }
    for (let w of wallets.internal) {
        walletStorage.internal.push({ name: w.name, privK: w.privK })
    }
    for (let w of wallets.external) {
        walletStorage.external.push({ name: w.name, privK: w.privK, curve: w.curve })
    }
    return walletStorage;
}

function syncStateToStore(storeAPI, reason) {
    let stateWallets = _getStateWallets(storeAPI);
    // We need the password from the user to perform vault updates so create a wrap callback and wait until the user provides it.
    toast.warn(<SyncToastMessageWarning title="Vault Update Request" message="Password Needed -- Click Here"/>, {
        position: "bottom-right",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClick: () => {
            storeAPI.dispatch({
                type: MODAL_ACTION_TYPES.OPEN_PW_REQUEST, payload: {
                    reason: "Vault Syncronization -- " + reason,
                    cb: async (password) => {
                        await electronStoreCommonActions.updateVaultWallets(password, stateWallets)
                        toast.success(<SyncToastMessageSuccess title="Success" message={reason}/>, {
                            position: "bottom-right",
                            autoClose: 2400,
                            delay: 500,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                        });
                    }
                }
            })
        }
    });

}

async function syncOptoutStore(storeAPI, reason, keystoreAdded) {
    let ksString = keystoreAdded.string;
    let walletName = keystoreAdded.name;
    let updated = await electronStoreCommonActions.addOptOutKeystore(ksString, walletName);
}