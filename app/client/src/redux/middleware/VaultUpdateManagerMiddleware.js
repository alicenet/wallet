import { toast } from "react-toastify";
import { electronStoreCommonActions } from "store/electronStoreHelper";
import { MODAL_ACTION_TYPES } from 'redux/constants/_constants';
import { SyncToastMessageWarning, SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';

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
            if (state.vault.exists && !state.vault.is_locked && state.vault.is_locked !== null) {
                switch (action.type) {
                    case ACTION_ELECTRON_SYNC:
                        syncStateToStore(storeAPI, action.payload.reason); break;
                    default: break;
                }
            }
            // Do anything here: pass the action onwards with next(action),
            // or restart the pipeline with storeAPI.dispatch(action)
            // Can also use storeAPI.getState() here
            return next(action)
        }
    }
}

function syncStateToStore(storeAPI, reason) {
    let wallets = storeAPI.getState().vault.wallets;
    let walletStorage = { internal: [], external: [] }
    for (let w of wallets.internal) {
        walletStorage.internal.push({ name: w.name, privK: w.privK })
    }
    for (let w of wallets.external) {
        walletStorage.external.push({ name: w.name, privK: w.privK, curve: w.curve })
    }

    // We need the password from the user to perform vault updates so create a wrap callback and wait until the user provides it.
    toast.warn(<SyncToastMessageWarning title="Vault Update Request" message="Password Needed -- Click Here" />, {
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
                        await electronStoreCommonActions.updateVaultWallets(password, walletStorage)
                        toast.success(<SyncToastMessageSuccess title="Success" message={reason} />, {
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