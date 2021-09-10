import { VAULT_ACTION_TYPES } from 'redux/constants/_constants';
import { buildVaultStateObject } from 'redux/reducers/vault'
import { electronStoreCommonActions } from 'store/electronStoreHelper';
import util from 'util/_util';

/* !!!!!!! ____   ATTENTION: ______ !!!!!!!!  

It is critical that new vault actions have implementations written in the WalletManagerMiddleware to facilitate syncronous state between
the global MadNetJS Wallet and the Redux State! 

To facilitate the Virtual DOM being updated when wallet mutation happens, we store a immutable state collection of
what the MadNetWallet object in ../middleware/WalletManagerMiddleware is composed of to the reduxState :: Immutable keys are stored in state, while
the mutable Wallet objects themselves are handled within MadNetWalletJS's instance 

:: This way wallet actions occuring in the Redux state are mirrored to MadWallet.Account global mutable.

:: Some dispatched actions occur exclusively in the middleware!
  
*/

/**
 * Stores new HD Vault to state, as well as storing to the secure-electron-store
 * @param {String} mnemonic 
 * @param {String} password 
 */
export function generateNewSecureHDVault(mnemonic, password) {
    return async function (dispatch) {
        let [preflightHash, firstWalletNode] = await electronStoreCommonActions.createNewSecureHDVault(mnemonic, password);
        electronStoreCommonActions.storePreflightHash(preflightHash);
        // Create and dispatch the vault state object
        const vaultPayload = buildVaultStateObject({ preflightHash: preflightHash, internalWallets: [firstWalletNode.privateKey] })
        dispatch({ type: VAULT_ACTION_TYPES.SET_VAULT_TO_STATE, payload: vaultPayload });
    }
}

/** After a vault has been decrypted call this actions for any wallets to be added to the internal keyring and to the MadWallet object within state
 * Internal keyring wallets are validated for existence and stored inside the vault
 * @param {String} walletName - The name of the wallet - extracted from the vault
 * @param {String} privKey - The private key of this wallet - extracted from the vault 
*/
export function addInternalWalletToState(walletName, privKey) {
    return async function (dispatch) {
        // Generate the wallet object
        const walletToAdd = util.wallet.generateStateWalletObject(walletName, privKey);
        dispatch({ type: VAULT_ACTION_TYPES.ADD_INTERNAL_WALLET, payload: walletToAdd });
    }
}