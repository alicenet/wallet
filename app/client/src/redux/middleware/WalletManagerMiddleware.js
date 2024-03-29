import AliceNetWallet from 'alicenetjs';
import { MIDDLEWARE_ACTION_TYPES, VAULT_ACTION_TYPES } from '../constants/_constants';
import util from 'util/_util';
import utils from 'util/_util';
import { walletManMiddleware_logger as log } from '../../log/logHelper.js';
import { curveTypes } from 'util/wallet';

let aliceNetWallet = new AliceNetWallet();

/**
 * Syncronoizes state between the mutable aliceNetWallet instance above and the redux store that saves immutable data about the wallets
 * @param {*} storeAPI
 * @returns { Function }
 */
export default function WalletManagerMiddleware(storeAPI) {
    return function wrapDispatch(next) {
        return function handleAction(action) {
            switch (action.type) {
                case MIDDLEWARE_ACTION_TYPES.INIT_ALICENET_WALLET:
                    return initAliceNetWallet(action.payload, storeAPI.dispatch);
                case MIDDLEWARE_ACTION_TYPES.ADD_WALLET_FROM_KEYSTORE:
                    return addWalletFromKeystore(action.payload.data, action.payload.name, storeAPI.dispatch, storeAPI.getState);
                case MIDDLEWARE_ACTION_TYPES.ADD_NEXT_HD_WALLET:
                    return addNextHDWallet(storeAPI, action.payload.name);
                case MIDDLEWARE_ACTION_TYPES.REINSTANCE_ALICENET_WALLET:
                    return reinstanceAliceNetWallet();
                case MIDDLEWARE_ACTION_TYPES.REMOVE_WALLET:
                    return removeWallet(action.payload);
                default:
                    break;
            }
            // Do anything here: pass the action onwards with next(action),
            // or restart the pipeline with storeAPI.dispatch(action)
            // Can also use storeAPI.getState() here
            return next(action);
        }
    }
}

/** Used to reinstance AliceNetJS -- Used to locked wallet :: Old instance should be picked up by garbage collection */
function reinstanceAliceNetWallet() {
    // Remove accounts from current instance
    aliceNetWallet.Account.accounts = [];
    // Recreate a new instance on the old reference
    aliceNetWallet = new AliceNetWallet();
}

/**
 * Used to maintain consistent array structure for handling wallet data
 * @param { String } pKey - Private Key
 * @param { Integer } curve - Curve to use
 * @param { String } name - Wallet Name
 * */
async function _walletArrayStructure(pKey, curve, name, address = "") {
    // If no address passed, shim it for checks that may rely on it
    if (!address) {
        address = curve === curveTypes.SECP256K1 ? await util.wallet.getSecp256k1FromPrivKey(pKey) : await util.wallet.getBNfromPrivKey(pKey);
    }
    return [pKey, curve, name, address];
}

/**
 * WalletManagerMiddleware parsing of SET_VAULT_TO_STATE action
 * @param { Object } initPayload - Payload called from SET_VAULT_TO_STATE
 * @returns { Array } [isDone?, [array of errors] ]
 */
function initAliceNetWallet(initPayload, dispatch) {
    return new Promise(async res => {
        log.debug("Initiating AliceNetWallet Instance & Synchronizing to Redux State. . .")
        // Extract all wallets from payload and add to AliceNetWallet.Accounts
        let internalAccountAdds = []; // Internal HD Accounts
        let externalAccountAdds = []; // Externally imported accounts
        for (let walletType in initPayload.wallets) {
            for (let wallet of initPayload.wallets[walletType]) {
                if (walletType === "internal") {
                    internalAccountAdds.push(await _walletArrayStructure(wallet.privK, wallet.curve, wallet.name, wallet.address));
                }
                else { // else, is an external wallet
                    externalAccountAdds.push(await _walletArrayStructure(wallet.privK, wallet.curve, wallet.name, wallet.address));
                }
            }
        }
        // Aggregate accounts to add into all accountAdds with marker for internal vs external

        // Wrap in a try just in case something bad happens
        try {
            let allToAdd = [...internalAccountAdds, ...externalAccountAdds];
            let addedPromises = [];
            // Wrap these in an additional IIFE promise that we can reject on failure so promise.all doesn't bail.
            allToAdd.forEach((addition) => {
                addedPromises.push((
                    async () => {
                        return new Promise(async res => {
                            try {
                                await aliceNetWallet.Account.addAccount(addition[0], addition[1])
                                res(true);
                            } catch (ex) {
                                if (ex.message === "Account.addAccount: Account already added") {
                                    log.warn("Wallet " + addition[2] + " already exists in the AliceNetJS Instance.")
                                    res({ error: "Wallet " + addition[2] + " already exists." })
                                }
                                res({ error: ex });
                            }
                        });
                    })());
            }); // [privK, curveInt] })
            Promise.all(addedPromises).then(async (values) => {
                let errors = [];
                values.forEach(value => {
                    if (value.error) {
                        errors.push(value.error);
                    }
                })
                // After adding inject internal || external based on match in previous array to redux state with constructed wallet objects
                let balancedState = await buildBalancedWalletState(internalAccountAdds, externalAccountAdds);
                log.debug("AliceNetWalletInit SUCCESS :: Dispatching set vault state ");
                dispatch({ type: VAULT_ACTION_TYPES.SET_WALLETS_STATE, payload: balancedState });
                res([true, errors]);
            });
        } catch (ex) {
            res({ error: "Error initiating AliceNetJs: ", ex });
        }
    });
}

/**
 * Add a keystore to AliceNetJS wallet state prior to sending to redux state
 * @param { Object } keystore - JSON Keystore containing the key to add
 * @param { Function } dispatch - Redux Dispatch
 * @returns { Object } - List of added wallets
 */
function addWalletFromKeystore(keystore, walletName, dispatch, getState) {
    return new Promise(async res => {
        // Extract pkey from keystore
        let pKey = keystore.privateKey;
        // Extract the curve if viable -- Will only be present on AliceNetJs Generated Stores :: Fallback to SECP256k1
        let curve = keystore.curve ? keystore.curve : 1;
        // Verify curve
        if (curve !== curveTypes.SECP256K1 && curve !== curveTypes.BARRETO_NAEHRIG) {
            throw new Error("An invalid curve was found within a keystore: " + curve);
        }
        // Verify that the private key is not already being used with a wallet in state
        const walletState = getState().vault.wallets;
        const wallets = [...walletState.internal, ...walletState.external];

        let pKeyMatches = wallets.filter(wallet => wallet.privK === util.wallet.strip0x(pKey));
        if (pKeyMatches.length > 0) {
            res({ error: "This private key is already loaded as wallet: " + pKeyMatches[0].name });
        }
        // Add the private key to the AliceNetJs instance
        try {
            await aliceNetWallet.Account.addAccount(pKey, curve);
            // Balance the wallet state to redux with the wallet name
            let address = curve === curveTypes.BARRETO_NAEHRIG ? await utils.wallet.getBNfromPrivKey(pKey) : await utils.wallet.getSecp256k1FromPrivKey(pKey);
            let externalAdds = [await _walletArrayStructure(util.wallet.strip0x(pKey), curve, walletName, address)];
            let balancedState = await buildBalancedWalletState([], externalAdds);
            res(balancedState);
        } catch (ex) {
            if (ex.message === "Account.addAccount: Account already added") {
                log.warn("Wallet " + walletName + " already exists in the AliceNetJs Instance.")
                res({ error: "Wallet " + walletName + " already exists." })
            }
            res({ error: ex });
        }
    });
}

/**
 * Determine next HD Wallet to add, and subsequently add it to AliceNetJs and return any additions that have been made
 * @param { Object } storeAPI  - Redux store api -- Notabley has dispatch and getState as needed
 * @param { String } walletName - Name for the new HD Wallet
 */
function addNextHDWallet(storeAPI, walletName) {
    return new Promise(async res => {
        let vaultState = storeAPI.getState().vault;
        // Get the next HD Wallet in order of derivation
        let internalWallets = vaultState.wallets.internal;
        // Note the mnemonic and curve
        let mnemonic = vaultState.mnemonic;
        let desiredCurve = vaultState.hd_curve;
        // Determine the next HD Wallet path, Main is at /0 for reference :: We can use length of internal wallets for the next path
        let nextDerrivationPath = internalWallets.length;
        // Derive the next path from the HD Chain retrieved from the mnemonic
        let nextHdWallet = await utils.wallet.streamLineHDWalletNodeFromMnemonic(mnemonic, nextDerrivationPath);
        // Generate internal wallet object
        let walletObj = await utils.wallet.generateBasicWalletObject(walletName, nextHdWallet.privateKey.toString('hex'), desiredCurve);
        // Add the private key to the AliceNetJs instance
        try {
            await aliceNetWallet.Account.addAccount(walletObj.privK, walletObj.curve);
            // Balance the wallet state to redux with the wallet name
            let internalAdds = [await _walletArrayStructure(util.wallet.strip0x(walletObj.privK), walletObj.curve, walletObj.name)];
            let balancedState = await buildBalancedWalletState(internalAdds, []);
            res(balancedState);
        } catch (ex) {
            if (ex.message === "Account.addAccount: Account already added") {
                log.warn("Wallet " + walletName + " already exists in the AliceNetJs Instance.");
                res({ error: "Wallet " + walletName + " already exists." });
            }
            res({ error: ex });
        }
    })
}

/**
 * Build wallet state object against current AliceNetJs instance accounts and passed wallets -- The return can be used to dispatch updated wallets accordingly
 * @param { Array } internalAdds - List of recently added internal _walletArrayStructs that need to be balanced
 * @param { Array } externalAdds - List of recently added external _walletArrayStructs that need to be balanced
 * @returns { Object } - Object with internal and external wallet arrays
 */
function buildBalancedWalletState(internalAdds, externalAdds) {
    return new Promise(async res => {
        let allToAdd = [...internalAdds, ...externalAdds];
        let internalWallets = []; // Final Internal State Array
        let externalWallets = []; // Final External State Array
        for (let account of aliceNetWallet.Account.accounts) {
            let signerKeyToUse = parseInt(account.curve) === 1 ? "secpSigner" : "bnSigner";  // Key to use under MultiSigner for this account to get privK
            let privK = account.signer.privK; // Note the privK
            let address = account.address; // Note the address from AliceNetJs

            // Additionally check the expected derived address relative to the curve from signerKey for the filtering process
            privK = util.wallet.strip0x(privK); // Use 0x-stripped pkey
            let matches = allToAdd.filter(addition => addition[0] === privK && addition[3] === address);
            // Match privK to an account from AliceNetWallet.accounts if available -- This should only match once per iteration
            let match = matches[0];

            if (matches.length > 1) {
                throw Error("During balancing, a private key & address combo was filtered twice. This signals a duplicate wallet. Verify state balancing does not allow multiple matches per iteration. Check all forwarded paramaters and current state.");
            }
            // Construct the wallet based off of data creation from alicenetwallet -- We let Alice Net wallet build this data and then store it back to state
            if (!match) {
                log.warn("No match found for recently added wallet list against a AliceNetJs Account List -- This is normal during additions up to the current wallet count, only matches need balanced.");
                continue;
            }
            let walletObj = util.wallet.constructWalletObject(
                match[2], // 2nd index in initial parsing gives us the name,
                account.signer.privK,
                account.address,
                signerKeyToUse === "bnSigner" ? util.wallet.curveTypes.BARRETO_NAEHRIG : util.wallet.curveTypes.SECP256K1,
                internalAdds.filter(addition => addition[0] === privK).length === 1 // is this an internal wallet?
            );
            if (walletObj.isInternal) {
                internalWallets.push(walletObj);
            }
            else {
                externalWallets.push(walletObj);
            }
        }
        res({ internal: internalWallets, external: externalWallets });
    });
}

/**
 * Return reference to active aliceNetWallet instance
 * @returns { Function }
 */
export function getAliceNetWalletInstance() {
    return aliceNetWallet;
}

/**
 * Remove a wallet from the vault referenced by address and push the update to the store
 * -- Requires password
 * @param { Array } wallets -- Wallets from state
 * @param { Object } targetWallet -- Wallet object from redux state
 * @param { Boolean } optout -- Index 0 of external wallets must not be allowed removal
 * @param { Boolean } exists -- A Vault exists. Index 0 of internal wallets must not be allowed removal. All Externals can be removed if a user has a vault
 */
export function removeWallet({ wallets, targetWallet, optout, exists }) {
    return new Promise(async res => {

        let internalWallets = [...wallets.internal];
        let externalWallets = [...wallets.external];

        // First determine if internal or external
        // Is internal
        if (targetWallet.isInternal) {
            if (exists && internalWallets.findIndex(w => w.address === targetWallet.address) === 0) {
                res({ error: 'If a Vault exists, main internal wallet must not be removed' });
            }
            else {
                internalWallets = internalWallets.filter(w => (targetWallet.address !== w.address));
            }
        }
        // Else external...
        else {
            if (optout && externalWallets.findIndex(w => w.address === targetWallet.address) === 0) {
                res({ error: 'If user has opted out, main external wallet must not be removed' });
            }
            else {
                externalWallets = externalWallets.filter(w => (targetWallet.address !== w.address));
            }
        }

        let aliceNetWalletInstance = getAliceNetWalletInstance();
        aliceNetWalletInstance.Account.removeAccount(targetWallet.address);

        // Recompile newly mutated wallet states, this should be balancedState
        let newWalletsState = { internal: internalWallets, external: externalWallets };
        res(newWalletsState);
    });
}