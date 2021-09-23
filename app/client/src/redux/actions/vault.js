import { VAULT_ACTION_TYPES, MIDDLEWARE_ACTION_TYPES } from 'redux/constants/_constants';
import { getMadWalletInstance } from 'redux/middleware/WalletManagerMiddleware'
import { electronStoreCommonActions } from '../../store/electronStoreHelper';
import util from 'util/_util';

/* !!!!!!! ____   ATTENTION: ______ !!!!!!!!  

It is critical that new vault actions have implementations written in the WalletManagerMiddleware to facilitate syncronous state between
the global MadNetJS Wallet and the Redux State! 

To facilitate the Virtual DOM being updated when wallet mutation happens, we store a immutable state collection of
what the MadNetWallet object in ../middleware/WalletManagerMiddleware is composed of to the reduxState :: Immutable keys are stored in state, while
the mutable Wallet objects themselves are handled within MadNetWalletJS's instance 

:: This way wallet actions occurring in the Redux state are mirrored to MadWallet.Account global mutable.

:: Some dispatched actions occur exclusively in the middleware!
  
*/

/**
 * Stores new HD Vault to state, as well as storing to the secure-electron-store -- WARNING: This erases stored vault! Use for new vault initiation ONLY
 * @param {String} mnemonic - Mnemonic to use to generate new vault
 * @param {String} password  - Password to encrypt vault with
 * @param {String} curveType - Curve type for public address derivation :: default: see util.wallet curve types -- Default secp256k1
 */
export function generateNewSecureHDVault(mnemonic, password, curveType = util.wallet.curveTypes.SECP256K1) {
    return async function (dispatch) {
        let [preflightHash, firstWalletNode] = await electronStoreCommonActions.createNewSecureHDVault(mnemonic, password, curveType);
        electronStoreCommonActions.storePreflightHash(preflightHash); // Store preflight hash for pre-action auth checking
        const preInitPayload = { wallets: { internal: [{ privK: firstWalletNode.privateKey.toString('hex'), name: "Main Wallet", curve: curveType }], external: [] } }; // Payload needed by initMadWallet() in WalletManagerMiddleware
        dispatch({ type: MIDDLEWARE_ACTION_TYPES.INIT_MAD_WALLET, payload: preInitPayload }); // Pass off to MadWalletMiddleware to finish state initiation
    }
}

/**
 * Used to load a secure HD vault from storage -- Passes to WalletMiddleware to sync MadWallet state.
 * @param { String } password - The password used to initially encrypt the vault 
 */
export function loadSecureHDVaultFromStorage(password) {
    return async function (dispatch) {
        let wu = util.wallet;
        // Unlock vault for parsing and note the mnemonic for HD wallets 
        const unlockedVault = await electronStoreCommonActions.unlockAndGetSecuredHDVault(password);
        const mnemonic = unlockedVault.mnemonic;
        const hdLoadCount = unlockedVault.hd_wallet_count;
        const hdCurve = unlockedVault.hd_wallet_curve;
        // Verify curve integrity
        if (hdCurve !== 1 && hdCurve !== 2) {
            throw new Error("Vault state HD Curve is incoompatible. Should be int(1) or int(2). Curve read: " + hdCurve);
        }
        // Extract internal wallets by using mnemonic
        let hdNodesToLoad = [];
        for (let i = 1; i <= hdLoadCount; i++) {
            hdNodesToLoad.push(i);
        }
        const internalHDWallets = await wu.streamLineHDWalletNodesFromMnemonic(mnemonic, hdNodesToLoad);
        const preInitPayload = { wallets: { internal: [], external: [] } }; // Payload needed by initMadWallet() in WalletManagerMiddleware
        internalHDWallets.forEach((walletNode, nodeIdx) => {
            const walletName = unlockedVault.wallets.internal[nodeIdx].name; // Pair walletNode IDX with it's name
            // Construct the wallet Object
            const internalWalletObj = {
                name: walletName,
                privK: walletNode.privateKey.toString('hex'),
                curve: hdCurve,
            }
            preInitPayload.wallets.internal.push(internalWalletObj); // Add it to the wallet init
        })
        // CAT - TODO: Add external wallet parsing support
        dispatch({ type: MIDDLEWARE_ACTION_TYPES.INIT_MAD_WALLET, payload: preInitPayload }); // Pass off to MadWalletMiddleware to finish state initiation
        return true;
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

/**
 * Returns a reference to the mad wallet instance from WalletManagerMiddleware
 * @returns {Object<MadWallet-JS>}
 */
export function getMadWallet() {
    return function (dispatch) {
        return getMadWalletInstance();
    }
}