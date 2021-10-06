import MadWallet from 'madwalletjs';
import { MIDDLEWARE_ACTION_TYPES, VAULT_ACTION_TYPES } from '../constants/_constants';
import util from 'util/_util';
import { walletManMiddleware_logger as log } from '../../log/logHelper.js'
import { curveTypes } from 'util/wallet';
import utils from 'util/_util';

let madWallet = new MadWallet();

/**
 * Syncronoizes state between the mutable madWallet instance above and the redux store that saves immutable data about the wallets
 * @param {*} storeAPI
 * @returns
 */
export default function WalletManagerMiddleware(storeAPI) {
    return function wrapDispatch(next) {
        return function handleAction(action) {
            switch (action.type) {
                case MIDDLEWARE_ACTION_TYPES.INIT_MAD_WALLET:
                    return initMadWallet(action.payload, storeAPI.dispatch);
                case MIDDLEWARE_ACTION_TYPES.ADD_WALLET_FROM_KEYSTORE:
                    return addWalletFromKeystore(action.payload.data, action.payload.name, storeAPI.dispatch);
                case MIDDLEWARE_ACTION_TYPES.ADD_NEXT_HD_WALLET:
                    return addNextHDWallet(storeAPI, action.payload.name); break;
                case MIDDLEWARE_ACTION_TYPES.REINSTANCE_MAD_WALLET:
                    reinstanceMadWallet(); break;
                default: break;
            }
            // Do anything here: pass the action onwards with next(action),
            // or restart the pipeline with storeAPI.dispatch(action)
            // Can also use storeAPI.getState() here
            return next(action)
        }
    }
}

/** Used to reinstance madWalletJS -- Used to locked wallet :: Old instance should be picked up by garbage collection */
function reinstanceMadWallet() {
    // Remove accounts from current instance
    madWallet.Account.accounts = [];
    // Recreate a new instance on the old reference
    madWallet = new MadWallet();
}

/** 
 * Used to maintain consistent array structure for handling wallet data 
 * @param { String } pKey - Private Key
 * @param { Integer } curve - Curve to use
 * @param { String } name - Wallet Name
 * */
function _walletArrayStructure(pKey, curve, name) {
    return [pKey, curve, name];
}

/**
 * WalletManagerMiddleware parsing of SET_VAUL_TO_STATE action
 * @param { Object } initPayload - Payload called from SET_VAULT_TO_STATE
 * @returns { Array } [isDone?, [array of errors] ]
 */
function initMadWallet(initPayload, dispatch) {
    return new Promise(res => {
        log.debug("Initiating MadWallet Instance & Synchronizing to Redux State. . .")
        // Extract all wallets from payload and add to MadWallet.Accounts
        let internalAccountAdds = []; // Internal HD Accounts
        let externalAccountAdds = []; // Externally imported accounts
        for (let walletType in initPayload.wallets) {
            for (let wallet of initPayload.wallets[walletType]) {
                if (walletType === "internal") {
                    internalAccountAdds.push(_walletArrayStructure(wallet.privK, wallet.curve, wallet.name));
                }
                else { // else, is an external wallet
                    externalAccountAdds.push(_walletArrayStructure(wallet.privK, wallet.curve, wallet.name));
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
                                await madWallet.Account.addAccount(addition[0], addition[1])
                                res(true);
                            } catch (ex) {
                                if (ex.message === "Account.addAccount: Account already added") {
                                    log.warn("Wallet " + addition[2] + " already exists in the MadWalletJS Instance.")
                                    res({ error: "Wallet " + addition[2] + " already exists." })
                                }
                                res({ error: ex })
                            }
                        })
                    })());
            }); // [privK, curveInt] })
            Promise.all(addedPromises).then(async (values) => {
                let errors = [];
                values.forEach(value => {
                    if (value.error) {
                        errors.push(value.error)
                    }
                })
                // After adding inject internal || external based on match in previous array to redux state with constructed wallet objects
                let balancedState = await buildBalancedWalletState(internalAccountAdds, externalAccountAdds);
                log.debug("MadWalletInit SUCCESS :: Dispatching set vault state ")
                dispatch({ type: VAULT_ACTION_TYPES.SET_WALLETS_STATE, payload: balancedState })
                res([true, errors]);
            });
        } catch (ex) {
            res({ error: "Error initiating madWalletJs: ", ex });
        }

    });
}

/**
 * Add a keystore to madwalletJS wallet state prior to sending to redux state
 * @param { Object } keystore - JSON Keystore containing the key to add
 * @param { Function } dispatch - Redux Dispatch 
 * @returns { Object } - List of added wallets
 */
function addWalletFromKeystore(keystore, walletName, dispatch) {
    return new Promise(async res => {
        // Extract pkey from keystore
        let pKey = keystore.privateKey;
        // Extract the curve if viable -- Will only be present on MadWalletJS Generated Stores :: Fallback to SECP256k1
        let curve = keystore.curve ? keystore.curve : 1;
        // Verify curve
        if (curve !== curveTypes.SECP256K1 && curve !== curveTypes.BARRETO_NAEHRIG) {
            throw new Error("An invalid curve was found within a keystore: " + curve);
        }
        // Add the private key to the MadWalletJS instance
        try {
            await madWallet.Account.addAccount(pKey, curve);
            // Balance the wallet state to redux with the wallet name
            let externalAdds = [_walletArrayStructure(util.wallet.strip0x(pKey), curve, walletName)];
            let balancedState = await buildBalancedWalletState([], externalAdds);
            res(balancedState)
        } catch (ex) {
            if (ex.message === "Account.addAccount: Account already added") {
                log.warn("Wallet " + walletName + " already exists in the MadWalletJS Instance.")
                res({ error: "Wallet " + walletName + " already exists." })
            }
            res({ error: ex });
        }
    })
}

/**
 * Determine next HD Wallet to add, and subsequently add it to MadWalletJS and return any additions that have been made
 * @param { Object } storeAPI  - Redux store api -- Notabley has dispatch and getState as needed
 * @param { String } walletName - Name for the new HD Wallet
 */
function addNextHDWallet(storeAPI, walletName) {
    return new Promise(async res => {
        let vaultState = storeAPI.getState().vault;
        // Get the next HD Wallet in order of derrivation
        let internalWallets = vaultState.wallets.internal;
        // Note the mnemonic and curve
        let mnemonic = vaultState.mnemonic;
        let desiredCurve = vaultState.hd_curve;
        // Determine the next HD Wallet path, Main is at /0 for refernece :: We can use length of internal wallets for the next path
        let nextDerrivationPath = internalWallets.length;
        // Derrive the next path from the HD Chain retrieved from the mnemonic
        let nextHdWallet = await utils.wallet.streamLineHDWalletNodeFromMnemonic(mnemonic, nextDerrivationPath);
        // Generate internal wallet object
        let walletObj = utils.wallet.generateBasicWalletObject(walletName, nextHdWallet.privateKey.toString('hex'), desiredCurve);
        // Add the private key to the MadWalletJS instance
        try {
            await madWallet.Account.addAccount(walletObj.privK, walletObj.curve);
            // Balance the wallet state to redux with the wallet name
            let internalAdds = [_walletArrayStructure(util.wallet.strip0x(walletObj.privK), walletObj.curve, walletObj.name)];
            let balancedState = await buildBalancedWalletState(internalAdds, []);
            res(balancedState)
        } catch (ex) {
            if (ex.message === "Account.addAccount: Account already added") {
                log.warn("Wallet " + walletName + " already exists in the MadWalletJS Instance.")
                res({ error: "Wallet " + walletName + " already exists." })
            }
            res({ error: ex });
        }
    })
}

/**
 * Build wallet state object against current madWalletJS instance accounts and passed wallets -- The return can be used to dispatch updated wallets accordingly
 * @param { Array } internalAdds - List of recently added internal _walletArrayStructs that need to be balanced
 * @param { Array } externalAdds - List of recently added external _walletArrayStructs that need to be balanced 
 * @returns { Object } - Object with internal and external wallet arrays 
 */
function buildBalancedWalletState(internalAdds, externalAdds) {
    return new Promise(res => {
        let allToAdd = [...internalAdds, ...externalAdds];
        let internalWallets = []; // Final Internal State Array
        let externalWallets = []; // Final External State Array
        for (let account of madWallet.Account.accounts) {
            let signerKeyToUse = parseInt(account.MultiSigner.curve) === 1 ? "secpSigner" : "bnSigner";  // Key to use under MultiSigner for this account to get privK
            let privK = account.MultiSigner[signerKeyToUse].privK; // Note the privK
            privK = util.wallet.strip0x(privK); // Use 0x-stripped pkey
            let match = allToAdd.filter(addition => addition[0] === privK)[0]; // Match privK to an account from MadNetWallet.accounts if available
            // Construct the wallet based off of data creation from madwallet -- We let mad wallet build this data and then store it back to state 
            if (!match) {
                log.warn("No match found for recently added wallet list against a MadWalletJS Account List -- This is normal during additions up to the current wallet count, only matches need balanced.")
                continue
            }
            let walletObj = util.wallet.constructWalletObject(
                match[2], // 2nd index in initial parsing gives us the name,
                account.MultiSigner[signerKeyToUse].privK,
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
            res({ internal: internalWallets, external: externalWallets });
        };
    })
}

/**
 * Return reference to active madWallet instance
 * @returns
 */
export function getMadWalletInstance() {
    return madWallet;
}