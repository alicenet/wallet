import { VAULT_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from 'log/logHelper'

/**
 * Used to build complex updates to the vault state as a whole or the initial vault state
 * @param { Object  } options
 * @param { Boolean } options.exists - Does the vault exist -- Default: true
 * @param { Boolean } options.isLocked - Is the vault locked -- Default: false
 * @param { String } options.preflightHash - keccak256 hash of the password used to secure this vault
 * @param { Array } options.internalWallets - Array of <InternalWallets> -- Default []
 * @param { Array } options.externalWallets - Array of <ExternalWallets> -- Default []
 * @returns { Object } -- JSON Object for vault state
 */
export const buildVaultStateObject = ({ exists = true, isLocked = false, preflightHash = "", internalWallets = [], externalWallets = [] } = {}, hdCurve = "secp256k1") => {
    return {
        exists: exists, // Does the "vault" key exist in the electron store?
        is_locked: isLocked, // Locking vault wipes current state :: Required user to re-enter password -- Vault is deciphered and reloaded
        preflight_hash: preflightHash, // keccak256 hash of the user-admin password :: The password for this hash is used for encrypting the vault and performing admin tasks
        hd_curve: hdCurve, // Curve used for internal wallets
        wallets: {
            external: externalWallets, // Array of <WalletObject>s as defined below
            internal: internalWallets, // Array of <WalletObject>s as defined below
        },
    }
}

// The vault reducer contains all information regarding the user and their wallets state
const initialVaultState = buildVaultStateObject({ exists: false });

//////////////////////////////////////
/* Vault State Object Constructors */
/////////////////////////////////////
/**
 * 
 * @param { Object } walletDetails - Object composed of wallet details
 * @property { String } walletDetails.name - Name of the wallet ( For UI )
 * @property { String } walletDetails.privK - Private Key for the wallet
 * @property { String } walletDetails.address - Address for this wallet ( For UI )
 * @property { String } walletDetauls.curve - Curve used to derrive public key from privK
 * @returns  { Object } - Wallet Object
 */
export const constructWalletObject = ({ name, privK, address, curve, isInternal }) => {
    return { name: name, privK: privK, address: address, curve: curve, isInternal: isInternal }
};

/* Vault Reducer */
export default function vaultReducer(state = initialVaultState, action) {

    switch (action.type) {

        case VAULT_ACTION_TYPES.SET_WALLETS_STATE:
            return Object.assign({}, state, {
                wallets: {
                    internal: action.payload.internal,
                    external: action.payload.external
                },
            })

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