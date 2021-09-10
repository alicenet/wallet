import { VAULT_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from 'log/logHelper'

// The user reducer contains all information regarding the user and their wallets state
const initialVaultState = {
    exists: "", // Does the "vault" key exist in the electron store?
    is_locked: "", // Locking vault wipes current state :: Required user to re-enter password -- Vault is deciphered and reloaded
    preflight_hash: "", // keccak256 hash of the user-admin password :: The password for this hash is used for encrypting the vault and performing admin tasks
    wallets: {
        external: [], // External wallets are stored as part of the encrypted vault
        internal: [], // Internal wallets are generated from the HD Chain and populated on decipher
    },
}


/**
 * Used to build complex updates to the vault state as a whole
 * @param { Object  } options
 * @param { Boolean } options.exists - Does the vault exist -- Default: true
 * @param { Boolean } options.isLocked - Is the vault locked -- Default: false
 * @param { String } options.preflightHash - keccak256 hash of the password used to secure this vault
 * @param { Array } options.internalWallets - Array of <InternalWallets> -- Default []
 * @param { Array } options.externalWallets - Array of <ExternalWallets> -- Default []
 * @returns { Object } -- JSON Object for vault state
 */
export const buildVaultStateObject = ({ exists = true, isLocked = false, preflightHash = "", internalWallets = [], externalWallets = [] } = {}) => {
    return {
        exists: exists,
        is_locked: isLocked,
        preflight_hash: preflightHash,
        wallets: {
            external: externalWallets,
            internal: internalWallets,
        },
    }
}

/* User Reducer */
export default function vaultReducer(state = initialVaultState, action) {

    switch (action.type) {

        case VAULT_ACTION_TYPES.ADD_EXTERNAL_WALLET:
            return Object.assign({}, state, {
                wallets: { internal: state.wallets.internal, external: [...state.wallets.external, action.payload] }
            })

        case VAULT_ACTION_TYPES.ADD_INTERNAL_WALLET:
            return Object.assign({}, state, {
                wallets: { internal: [...state.wallets.internal, action.payload], external: state.wallets.external }
            })

        case VAULT_ACTION_TYPES.SET_PREFLIGHT_HASH:
            return Object.assign({}, state, {
                preflight_hash: action.payload
            });

        case VAULT_ACTION_TYPES.SET_VAULT_TO_STATE:
            log.debug(["Performing large object=>vault_state payload update with:", action.payload]);
            return Object.assign({}, state, action.payload)

        default: return state;

    }

}