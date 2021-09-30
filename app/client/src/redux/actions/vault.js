import { VAULT_ACTION_TYPES, MIDDLEWARE_ACTION_TYPES } from 'redux/constants/_constants';
import { getMadWalletInstance } from 'redux/middleware/WalletManagerMiddleware'
import { electronStoreCommonActions } from '../../store/electronStoreHelper';
import { reduxState_logger as log } from 'log/logHelper';
import util from 'util/_util';
import { ACTION_ELECTRON_SYNC } from 'redux/middleware/VaultUpdateManagerMiddleware';
import { curveTypes } from 'util/wallet';

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
        await dispatch({ type: MIDDLEWARE_ACTION_TYPES.INIT_MAD_WALLET, payload: preInitPayload }); // Pass off to MadWalletMiddleware to finish state initiation
        dispatch({ type: VAULT_ACTION_TYPES.SET_MNEMONIC, payload: mnemonic});
        dispatch({ type: VAULT_ACTION_TYPES.MARK_EXISTS_AND_UNLOCKED });
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
        if (hdCurve !== curveTypes.SECP256K1 && hdCurve !== curveTypes.BARRETO_NAEHRIG) {
            throw new Error("Vault state HD Curve is incompatible. Should be int(1) or int(2). Curve read: " + hdCurve);
        }
        // Extract internal wallets by using mnemonic
        let hdNodesToLoad = [];
        for (let i = 0; i < hdLoadCount; i++) {
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
        // Add externals to preInit
        unlockedVault.wallets.external.forEach(wallet => {
            const internalWalletObj = {
                name: wallet.name,
                privK: wallet.privK,
                curve: wallet.curve, 
            }
            preInitPayload.wallets.external.push(internalWalletObj); // Add it to the wallet init
        })
        let res = await dispatch({ type: MIDDLEWARE_ACTION_TYPES.INIT_MAD_WALLET, payload: preInitPayload }); // Pass off to MadWalletMiddleware to finish state initiation
        dispatch({ type: VAULT_ACTION_TYPES.MARK_EXISTS_AND_UNLOCKED });
        dispatch({ type: VAULT_ACTION_TYPES.SET_MNEMONIC, payload: mnemonic});
        return res;
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
 * Adds an external wallet to state from a keystore -- A vault doesn't need to exist for this to be used.
 * @param { JSON } keystore - The still ciphered keystore
 * @param { String } password - The password to decipher the keystore
 * @param { String } walletName - Name to be used to reference the external wallet
 */
export function addExternalWalletToState(keystore, password, walletName) {
    return async function (dispatch) {
        let ksString;
        log.debug("Adding wallet with name ", walletName, " to external wallets from keystore: ", keystore);
        try {
            ksString = JSON.stringify(keystore);
        } catch (ex) {
            throw new Error("Must only pass valid JSON Keystore Object to addExternalWalletToState", ex)
        }
        let unlocked = { data: util.wallet.unlockKeystore(JSON.parse(ksString), password), name: walletName };
        console.log(unlocked);
        let additions = await dispatch({ type: MIDDLEWARE_ACTION_TYPES.ADD_WALLET_FROM_KEYSTORE, payload: unlocked }); // Pass off to MadWalletMiddleware to finish state balancing
        if (additions.error) { return additions }
        let added = await dispatch({ type: VAULT_ACTION_TYPES.ADD_EXTERNAL_WALLET, payload: additions.external[0] });
        // When a wallet is added, dispatch sync-store
        dispatch({ type: ACTION_ELECTRON_SYNC, payload: {reason: "Adding External Wallet"} });
        return added;
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

/**
 * Dispatches actions to clear state and reinstance madWalletJs to prep it for garbage collection
 * @returns 
 */
export function lockVault() {
    return async function (dispatch) {
        return new Promise(async res => {
            await dispatch({ type: MIDDLEWARE_ACTION_TYPES.REINSTANCE_MAD_WALLET });
            await dispatch({ type: VAULT_ACTION_TYPES.LOCK_VAULT });
            res(true);
        })
    }
}