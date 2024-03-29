import React from 'react';
import { MIDDLEWARE_ACTION_TYPES, VAULT_ACTION_TYPES } from 'redux/constants/_constants';
import { getAliceNetWalletInstance } from 'redux/middleware/WalletManagerMiddleware'
import { electronStoreCommonActions, electronStoreUtilityActions } from '../../store/electronStoreHelper';
import { reduxState_logger as log } from 'log/logHelper';
import util from 'util/_util';
import utils from 'util/_util';
import { ACTION_ELECTRON_SYNC } from 'redux/middleware/VaultUpdateManagerMiddleware';
import { curveTypes } from 'util/wallet';
import { ADAPTER_ACTIONS, CONFIG_ACTIONS } from './_actions';
import web3Adapter from 'adapters/web3Adapter';
import { toast } from 'react-toastify';
import { SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';

/* !!!!!!! ____   ATTENTION: ______ !!!!!!!!  

It is critical that new vault actions have implementations written in the WalletManagerMiddleware to facilitate synchronous state between
the global AliceNetJS Wallet and the Redux State!

To facilitate the Virtual DOM being updated when wallet mutation happens, we store an immutable state collection of
what the AliceNetWallet object in ../middleware/WalletManagerMiddleware is composed of to the reduxState :: Immutable keys are stored in state, while
the mutable Wallet objects themselves are handled within AliceNetWalletJS's instance

:: This way wallet actions occurring in the Redux state are mirrored to AliceNetWallet.Account global mutable.

:: Some dispatched actions occur exclusively in the middleware!
  
*/

/**
 * Set the balances loading state to true
 */
export function setBalancesLoading(bool) {
    return async function (dispatch) {
        dispatch({ type: VAULT_ACTION_TYPES.SET_BALANCES_LOADING, payload: bool });
    }
}

/**
 * Stores new HD Vault to state, as well as storing to the secure-electron-store -- WARNING: This erases stored vault! Use for new vault initiation ONLY
 * @param {String} mnemonic - Mnemonic to use to generate new vault
 * @param {String} password  - Password to encrypt vault with
 * @param {String} curveType - Curve type for public address derivation :: default: see util.wallet curve types -- Default secp256k1
 */
export function generateNewSecureHDVault(mnemonic, password, curveType = util.wallet.curveTypes.SECP256K1, hint = "No hint provided") {
    return async function (dispatch) {
        // Anytime we generate a vault make sure to note the curve in the vault store as well 
        // -- This prevents immediately generated vault from not having the correct curve for new wallet generations
        dispatch({ type: VAULT_ACTION_TYPES.SET_CURVE, payload: curveType });
        let [preflightHash, firstWalletNode] = await electronStoreCommonActions.createNewSecureHDVault(mnemonic, password, curveType);
        electronStoreCommonActions.setPasswordHint(hint); //Store password hint
        electronStoreCommonActions.storePreflightHash(preflightHash); // Store preflight hash for pre-action auth checking
        let firstWallet = await utils.wallet.generateBasicWalletObject("Main Wallet", firstWalletNode.privateKey.toString('hex'), curveType);
        const preInitPayload = { wallets: { internal: [firstWallet], external: [] } }; // Payload needed by initAliceNetWallet() in WalletManagerMiddleware
        await dispatch({ type: MIDDLEWARE_ACTION_TYPES.INIT_ALICENET_WALLET, payload: preInitPayload }); // Pass off to AliceNetWalletMiddleware to finish state initiation
        dispatch({ type: VAULT_ACTION_TYPES.SET_MNEMONIC, payload: mnemonic });
        dispatch({ type: VAULT_ACTION_TYPES.MARK_EXISTS_AND_UNLOCKED });

        // Once a vault has been created -- Go ahead and make a backup of it
        let newVaultBackedUp = await electronStoreUtilityActions.backupStore();
        log.debug("New Vault Backup Success:", newVaultBackedUp);

        // Once the vault is created attempt to connect web3, and then aliceNet
        log.debug("Vault Created: Attempting to init AliceNet && Web3 Adapters. . .");
        let adaptersConnected = await dispatch(ADAPTER_ACTIONS.initAdapters());

        // Check and log any errors -- Allow unlock to happen even if network errors occur -- Appropriate toasts will be delivered to user via their respective adapaters
        if (adaptersConnected.error) {
            log.error("GeneralNetworkConnectionError:", adaptersConnected.error);
            log.error("AliceNetConnectionError: ", adaptersConnected.errors.aliceNet);
            log.error("Web3ConnectionError: ", adaptersConnected.errors.web3);
        }
    };
}

/**
 * Used to load a secure HD vault from storage -- Passes to WalletMiddleware to sync AliceNetWallet state.
 * @param { String } password - The password used to initially encrypt the vault
 * @returns { Array } [done<Bool>, errorArray<Array>]
 */
export function loadSecureHDVaultFromStorage(password) {
    return async function (dispatch) {
        let wu = util.wallet;
        // Unlock vault for parsing and note the mnemonic for HD wallets
        const unlockedVault = await electronStoreCommonActions.unlockAndGetSecuredHDVault(password);
        if (unlockedVault.error) {
            return [false, [unlockedVault]];
        }
        ; // Bubble the done/error upwards
        // Anytime we unlock a vault on user load without an error -- Assume it is in a healthy state and request a backup be made and wait for the response before moving on
        let backupSuccess = await electronStoreUtilityActions.backupStore();
        log.debug("Vault Backup Success:", backupSuccess);
        // Continue loading the vault
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
        const preInitPayload = { wallets: { internal: [], external: [] } }; // Payload needed by initAliceNetWallet() in WalletManagerMiddleware

        for (let i = 0; i < internalHDWallets.length; i++) {
            const walletNode = internalHDWallets[i];
            const walletName = unlockedVault.wallets.internal[i].name; // Pair walletNode IDX with it's name
            // Construct the wallet Object
            const internalWalletObj = await utils.wallet.generateBasicWalletObject(walletName, walletNode.privateKey.toString('hex'), hdCurve);
            preInitPayload.wallets.internal.push(internalWalletObj); // Add it to the wallet init
        }

        // Add externals to preInit
        for (let wallet of unlockedVault.wallets.external) {
            const internalWalletObj = await utils.wallet.generateBasicWalletObject(wallet.name, wallet.privK, wallet.curve);
            preInitPayload.wallets.external.push(internalWalletObj); // Add it to the wallet init
        }

        // Load any stored configuration values
        let configLoaded = await dispatch(CONFIG_ACTIONS.loadConfigurationValuesFromStore());
        if (configLoaded.error) {
            log.debug(configLoaded.error);
            toast.error("Error loading configuration values.");
        }

        let res = await dispatch({ type: MIDDLEWARE_ACTION_TYPES.INIT_ALICENET_WALLET, payload: preInitPayload }); // Pass off to AliceNetWalletMiddleware to finish state initiation
        dispatch({ type: VAULT_ACTION_TYPES.MARK_EXISTS_AND_UNLOCKED });
        dispatch({ type: VAULT_ACTION_TYPES.SET_CURVE, payload: hdCurve });
        dispatch({ type: VAULT_ACTION_TYPES.SET_MNEMONIC, payload: mnemonic });

        // Once the vault is unlocked attempt to connect web3, and then aliceNet
        log.debug("Vault Unlock: Attempting to init AliceNet && Web3 Adapters. . .");
        let adaptersConnected = await dispatch(ADAPTER_ACTIONS.initAdapters());

        // Check and log any errors -- Allow unlock to happen even if network errors occur -- Appropriate toasts will be delivered to user via their respective adapaters
        if (adaptersConnected.error) {
            log.error("GeneralNetworkConnectionError:", adaptersConnected.error);
            log.error("AliceNetConnectionError: ", adaptersConnected.errors.aliceNet);
            log.error("Web3ConnectionError: ", adaptersConnected.errors.web3);
        }

        return res;
    }
}

/** After a vault has been decrypted call this actions for any wallets to be added to the internal keyring and to the AliceNetWallet object within state
 * Internal keyring wallets are validated for existence and stored inside the vault
 * @param {String} walletName - The name of the wallet - extracted from the vault
 */
export function addInternalWalletToState(walletName) {
    return async function (dispatch, getState) {
        // Let the middleware handle wallet addition -- Await for any addition.errors
        let additions = await dispatch({ type: MIDDLEWARE_ACTION_TYPES.ADD_NEXT_HD_WALLET, payload: { name: walletName } });
        if (additions.error) {
            return additions;
        }
        // Add the internal wallet to redux state
        let added = await dispatch({ type: VAULT_ACTION_TYPES.ADD_INTERNAL_WALLET, payload: additions.internal[0] });
        // When a wallet is added, dispatch sync-store -- Provide keystoreString for optout keystore additions where necessary
        dispatch({ type: ACTION_ELECTRON_SYNC, payload: { reason: "Adding Internal Wallet" } });
        return added;
    }
}

/**
 * Adds an external wallet to state from a keystore -- A vault doesn't need to exist for this to be used.
 * @param { JSON } keystore - The still ciphered keystore
 * @param { String } password - The password to decipher the keystore
 * @param { String } walletName - Name to be used to reference the external wallet
 */
export function addExternalWalletToState(keystore, password, walletName) {
    return async function (dispatch, getState) {
        let ksString;
        log.debug("Adding wallet with name ", walletName, " to external wallets from keystore: ", keystore);
        try {
            ksString = JSON.stringify(keystore);
        } catch (ex) {
            throw new Error("Must only pass valid JSON Keystore Object to addExternalWalletToState", ex);
        }
        let unlocked = { data: util.wallet.unlockKeystore(JSON.parse(ksString), password), name: walletName };
        let additions = await dispatch({ type: MIDDLEWARE_ACTION_TYPES.ADD_WALLET_FROM_KEYSTORE, payload: unlocked }); // Pass off to AliceNetWalletMiddleware to finish state balancing
        // Waiting for the above to dispatch will prevent doubles from being added -- AliceNetJS will catch them
        if (additions.error) {
            return additions;
        }
        // If additions.external does not have at least one wallet, something is wrong
        if (additions.external.length < 1) {
            log.error("An attempt to add no additional wallets to redux state was almost made after a Middleware Action to ADD_WALLET_FROM_KEYSTORE")
            return additions;
        }
        let added = await dispatch({ type: VAULT_ACTION_TYPES.ADD_EXTERNAL_WALLET, payload: additions.external[0] });
        // When adding external wallets we need to check if this addition is to an existing vault -- If not, make sure we set optout as true.
        let hasVault = getState().vault.exists;
        let isOptout = getState().vault.optout;
        // If the vault has not been determined as existing by the time a wallet addition happens, we can safely assume this is an opt out user and mark as such
        if (!hasVault && !isOptout) { // We only need to dispatch this if the user isn't already marked as an optout
            dispatch({ type: VAULT_ACTION_TYPES.MARK_OPTOUT__VAULT_NONEXIST_AND_UNLOCKED }); // Set as optout user
        }
        // When a wallet is added, dispatch sync-store -- Provide keystoreString for optout keystore additions where necessary
        dispatch({ type: ACTION_ELECTRON_SYNC, payload: { reason: "Adding External Wallet", keystoreAdded: { string: ksString, name: walletName } } });
        return added;
    }
}

/**
 * Returns a reference to the Alice Net wallet instance from WalletManagerMiddleware
 * @returns {Object<AliceNetWallet-JS>}
 */
export function getAliceNetWallet() {
    return function () {
        return getAliceNetWalletInstance();
    }
}

/**
 * Dispatches actions to clear state and reinstance aliceNetJs to prep it for garbage collection
 * @returns { Function }
 */
export function lockVault() {
    return async function (dispatch) {
        return new Promise(async res => {
            toast.success(<SyncToastMessageSuccess hideIcon basic message="Locked & Disconnected" />, { autoClose: 1750, className: "basic" });
            await dispatch({ type: MIDDLEWARE_ACTION_TYPES.REINSTANCE_ALICENET_WALLET });
            await dispatch({ type: VAULT_ACTION_TYPES.LOCK_VAULT });
            // Additionally, mark web3 and AliceNet as not connected so they can be instanced on reconnect
            web3Adapter.setDefaultState(); // Mark default state on web3 adapter --
            await dispatch(ADAPTER_ACTIONS.disconnectAdapters()); // Mark adapter state back to default and disconnected
            res(true);
        });
    };
}

/**
 * Rename a wallet in the vault referenced by address and push the update to the store
 * -- Requires password
 * @param { Object } targetWallet -- Wallet object from redux state
 * @param { String } password -- Vault or administrative password -- For writing updates to store
 */
export function renameWalletByAddress(targetWallet, newName, password) {
    return async function (dispatch, getState) {
        // Get latest wallet state and create mutable instances of internal/external state
        let wallets = getState().vault.wallets;
        let internalWallets = [...wallets.internal];
        let externalWallets = [...wallets.external];
        // First determine if internal or external
        // Is internal
        if (targetWallet.isInternal) {
            let internalTargetIndex = internalWallets.findIndex(e => (targetWallet.address === e.address));
            if (internalTargetIndex === -1) {
                return { error: "Unable to find wallet in state." };
            }
            internalWallets[internalTargetIndex].name = newName;
        }
        // Else external...
        else {
            let externalTargetIndex = externalWallets.findIndex(e => (targetWallet.address === e.address));
            if (externalTargetIndex === -1) {
                return { error: "Unable to find wallet in state." };
            }
            externalWallets[externalTargetIndex].name = newName;
        }
        // Recompile newly mutated wallet states
        let newWalletsState = { internal: internalWallets, external: externalWallets };

        try {
            // Submit the update to the redux store --
            await dispatch({ type: VAULT_ACTION_TYPES.SET_WALLETS_STATE, payload: newWalletsState })
            // Submit it to the electron helper for writing the vault --
            await electronStoreCommonActions.updateVaultWallets(password, newWalletsState);
        } catch (ex) {
            return { error: ex };
        }

        return true;

    }
}

/**
 * Remove a wallet from the vault referenced by address and push the update to the store
 * -- Requires password
 * @param { Object } targetWallet -- Wallet object from redux state
 * @param { String } password -- Vault or administrative password -- For writing updates to store
 * @param { Boolean } optout -- Index 0 of external wallets must not be allowed removal
 * @param { Boolean } exists -- A Vault exists. Index 0 of internal wallets must not be allowed removal. All Externals can be removed if a user has a vault
 */
export function removeWalletByAddress(targetWallet, password, optout, exists) {
    return async function (dispatch, getState) {
        // Get latest wallet state and create mutable instances of internal/external state
        let wallets = getState().vault.wallets;
        try {
            const newWalletsState = await dispatch({ type: MIDDLEWARE_ACTION_TYPES.REMOVE_WALLET, payload: { wallets, targetWallet, optout, exists } });

            if (newWalletsState.error) {
                return { error: newWalletsState.error };
            }

            // Submit the update to the redux store --
            await dispatch({ type: VAULT_ACTION_TYPES.SET_WALLETS_STATE, payload: newWalletsState })

            // Password and updateVaultWallets required for vault users only
            // Submit it to the electron helper for writing the vault --
            if (exists) {
                await electronStoreCommonActions.updateVaultWallets(password, newWalletsState);
            }
            else {
                dispatch({ type: ACTION_ELECTRON_SYNC, payload: { reason: "Keystore removed", optOutWalletRemoved: targetWallet } });
            }

        } catch (ex) {
            return { error: ex }
        }

        return true;

    }
}