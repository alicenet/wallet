import { VAULT_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from 'log/logHelper'
import { curveTypes } from '../../util/_util';

/**
 * Used to build complex updates to the vault state as a whole or the initial vault state
 * @param { Object  } options
 * @param { Boolean } options.exists - Does the vault exist -- Default: true
 * @param { Boolean } options.isLocked - Is the vault locked -- Default: false
 * @param { Array } options.internalWallets - Array of <InternalWallets> -- Default []
 * @param { Array } options.externalWallets - Array of <ExternalWallets> -- Default []
 * @returns { Object } -- JSON Object for vault state
 */
export const buildVaultStateObject = ({ exists = false, isLocked = false, internalWallets = [], externalWallets = [] } = {}, hdCurve = curveTypes.SECP256K1, mnemonic = "") => {
    return {
        exists: exists, // Does the "vault" key exist in the electron store?
        is_locked: isLocked, // Locking vault wipes current state :: Required user to re-enter password -- Vault is deciphered and reloaded
        hd_curve: hdCurve, // Curve used for internal wallets
        mnemonic: mnemonic, // Mnemonic for HD Chain
        wallets: {
            external: externalWallets, // Array of <WalletObject>s as defined below
            internal: internalWallets, // Array of <WalletObject>s as defined below
        },
    }
}

// The vault reducer contains all information regarding the user and their wallets state
export const initialVaultState = buildVaultStateObject({ exists: false });

/* Vault Reducer */
export default function vaultReducer(state = initialVaultState, action) {

    switch (action.type) {

        // Used for locking -- Clears state
        case VAULT_ACTION_TYPES.LOCK_VAULT:
            log.debug("Redux Vault State Locked");
            return Object.assign({}, state, buildVaultStateObject({ exists: true, isLocked: true }));

        case VAULT_ACTION_TYPES.SET_MNEMONIC:
            log.debug("Setting Vault State Mnemonic to Redux State");
            return Object.assign({}, state, { mnemonic: action.payload });

        case VAULT_ACTION_TYPES.ADD_EXTERNAL_WALLET:
            log.debug("External Wallet Added To Redux State:", action.payload);
            return Object.assign({}, state, {
                wallets: { internal: state.wallets.internal, external: [...state.wallets.external, action.payload] }
            })

        case VAULT_ACTION_TYPES.ADD_INTERNAL_WALLET:
            log.debug("Internal Wallet Added To Redux State:", action.payload);
            return Object.assign({}, state, {
                wallets: { internal: [...state.wallets.internal, action.payload], external: state.wallets.external }
            })

        case VAULT_ACTION_TYPES.MARK_EXISTS_AND_LOCKED:
            log.debug("Marking Vault as existing and locked");
            return Object.assign({}, state, {
                exists: true,
                is_locked: true,
            })

        case VAULT_ACTION_TYPES.MARK_EXISTS_AND_UNLOCKED:
            log.debug("Marking Vault as existing and unlocked");
            return Object.assign({}, state, {
                exists: true,
                is_locked: false,
            })

        case VAULT_ACTION_TYPES.MARK_EXISTS:
            log.debug("Marking Vault as existing");
            return Object.assign({}, state, {
                exists: true,
            })

        case VAULT_ACTION_TYPES.SET_VAULT_TO_STATE:
            log.debug("Performing large object=>vault_state payload update with:", action.payload);
            return Object.assign({}, state, action.payload)

        case VAULT_ACTION_TYPES.SET_WALLETS_STATE:
            log.debug("Performing wallet state update:", action.payload);
            return Object.assign({}, state, {
                wallets: {
                    internal: action.payload.internal,
                    external: action.payload.external
                },
            })

        default: return state;

    }

}