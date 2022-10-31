import { VAULT_ACTION_TYPES } from "../constants/_constants";
import { reduxState_logger as log } from "log/logHelper";
import { curveTypes } from "util/_util";
import { toast } from "react-toastify";

/**
 * This vault reducer contains all state regarding user wallets
 * Even if a user is an optOut user, their wallets will be stored in 'wallets'
 */

/**
 * Used to build complex updates to the vault state as a whole or the initial vault state
 * @param { Object  } options
 * @param { Boolean } options.exists - Does the vault exist -- Default: true
 * @param { Boolean | String } options.isLocked - Is the vault locked -- Default: null == "unknown"
 * @param { Array } options.internalWallets - Array of <InternalWallets> -- Default []
 * @param { Array } options.externalWallets - Array of <ExternalWallets> -- Default []
 * @returns { Object } -- JSON Object for vault state
 */
export const buildVaultStateObject = (
    {
        exists = null,
        isLocked = null,
        optout = null,
        internalWallets = [],
        externalWallets = [],
    } = {},
    hdCurve = curveTypes.SECP256K1,
    mnemonic = ""
) => {
    return {
        exists: exists, // Does the "vault" key exist in the electron store? -- Checked on load :: Default NULL for unknown
        is_locked: isLocked, // Locking vault wipes current state :: Requires user to re-enter password -- Vault is deciphered and reloaded -- Determined on load :: Default NULL for unknown
        hd_curve: hdCurve, // VAULT USERS ONLY -- Curve used for internal wallets :: Used to determine the default curve for HD wallet generation
        mnemonic: mnemonic, // VAULT USERS ONLY -- Mnemonic for HD Chain --
        optout: optout, // Is the user a vault optout user?
        wallets: {
            external: externalWallets, // Array of <WalletObject>s as defined below
            internal: internalWallets, // Array of <WalletObject>s as defined below
        },
        unsyncedWallets: [
            // Wallet name
        ],
        balancesLoading: false, // Are balances being fetched?
        balances: {
            // Contains array of following obj structures:
            // eth: 0
            // util: 0
            // utilAllowance: 0
            // stake: 0
            // stakeAllowance: 0
            // aliceNetBytes: 0
            // aliceNetUTXOs: []
        }, // K:V store of address:balances,UTXOs -- Updated via AliceNetWallet and web3Wallet actions
        recentTxs: {
            // Recent TXs K:V per address:[..txs]
        },
    };
};

// The vault reducer contains all information regarding the user and their wallets state
export const initialVaultState = buildVaultStateObject();

/* Vault Reducer */
export default function vaultReducer(state = initialVaultState, action) {
    switch (action.type) {
        // Used for locking -- Clears state
        case VAULT_ACTION_TYPES.LOCK_VAULT:
            log.debug("Redux Vault State Locked");
            return Object.assign(
                {},
                state,
                buildVaultStateObject({
                    isLocked: true,
                    exists: state.exists,
                    optout: state.optout,
                })
            );

        case VAULT_ACTION_TYPES.SET_VAULT_TO_STATE:
            log.debug(
                "Performing large object=>vault_state payload update with:",
                action.payload
            );
            return Object.assign({}, state, action.payload);

        case VAULT_ACTION_TYPES.SET_WALLETS_STATE:
            log.debug("Performing wallet state update:", action.payload);
            return Object.assign({}, state, {
                wallets: {
                    internal: action.payload.internal,
                    external: action.payload.external,
                },
            });

        case VAULT_ACTION_TYPES.SET_MNEMONIC:
            log.debug("Setting Vault State Mnemonic to Redux State");
            return Object.assign({}, state, { mnemonic: action.payload });

        case VAULT_ACTION_TYPES.ADD_EXTERNAL_WALLET:
            log.debug("External Wallet Added To Redux State:", action.payload);
            return Object.assign({}, state, {
                wallets: {
                    internal: state.wallets.internal,
                    external: [...state.wallets.external, action.payload],
                },
                unsyncedWallets: [
                    ...state.unsyncedWallets,
                    action.payload.name,
                ],
            });

        case VAULT_ACTION_TYPES.ADD_INTERNAL_WALLET:
            log.debug("Internal Wallet Added To Redux State:", action.payload);
            return Object.assign({}, state, {
                wallets: {
                    internal: [...state.wallets.internal, action.payload],
                    external: state.wallets.external,
                },
                unsyncedWallets: [
                    ...state.unsyncedWallets,
                    action.payload.name,
                ],
            });

        case VAULT_ACTION_TYPES.CLEAR_UNSYNCED_WALLETS:
            log.debug("Reset unsynced wallets");
            // When unsycned are cleared, we can assume we don't need toasts showing for it
            toast.dismiss();
            return Object.assign({}, state, {
                unsyncedWallets: [],
            });

        case VAULT_ACTION_TYPES.SET_BALANCES_STATE:
            log.debug("Setting new balances state:", action.payload);
            return Object.assign({}, state, {
                balances: action.payload,
            });

        case VAULT_ACTION_TYPES.SET_BALANCES_LOADING:
            log.debug("Setting balancesLoading to false.", action.payload);
            return Object.assign({}, state, {
                balancesLoading: action.payload,
            });

        case VAULT_ACTION_TYPES.UPDATE_RECENT_TXS_BY_ADDRESS:
            log.debug("Setting new recent txs state:", action.payload);
            return Object.assign({}, state, {
                recentTxs: {
                    ...state.recentTxs,
                    [action.payload.address]: action.payload.txs,
                },
            });

        case VAULT_ACTION_TYPES.SET_CURVE:
            log.debug("Setting preferred vault curve state:", action.payload);
            return Object.assign({}, state, {
                hd_curve: action.payload,
            });

        ////////////////////
        // State Markers // -- Vault State Marker Actions
        ///////////////////

        // Mark vault as unlocked -- useful for tracking if keystores have been relocked into the optout store
        case VAULT_ACTION_TYPES.MARK_UNLOCKED:
            log.debug(
                "Marking Vault as unlocked -- Most likely for optout stores"
            );
            return Object.assign({}, state, {
                is_locked: false,
            });

        case VAULT_ACTION_TYPES.MARK_EXISTS_AND_LOCKED:
            log.debug("Marking Vault as existing and locked");
            return Object.assign({}, state, {
                exists: true,
                is_locked: true,
            });

        case VAULT_ACTION_TYPES.MARK_EXISTS_AND_UNLOCKED:
            log.debug("Marking Vault as existing and unlocked");
            return Object.assign({}, state, {
                exists: true,
                is_locked: false,
            });

        case VAULT_ACTION_TYPES.MARK_EXISTS:
            log.debug("Marking Vault as existing");
            return Object.assign({}, state, {
                exists: true,
            });

        case VAULT_ACTION_TYPES.MARK_OPTOUT__VAULT_NONEXIST_AND_UNLOCKED:
            log.debug("Marking Vault as OPTOUT :: non-existing, non-locked");
            return Object.assign({}, state, {
                exists: false,
                is_locked: false,
                optout: true,
            });

        case VAULT_ACTION_TYPES.MARK_NONEXIST_NONLOCK_NONOPTOUT:
            log.debug(
                "Marking Vault as clear: NON_EXISTING, NON_LOCKED, NON_OPTOUT"
            );
            return Object.assign({}, state, {
                exists: false,
                is_locked: false,
                optout: false,
            });

        default:
            return state;
    }
}
