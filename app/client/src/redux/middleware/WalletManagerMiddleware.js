import MadWallet from 'madwalletjs';
import { MIDDLEWARE_ACTION_TYPES, VAULT_ACTION_TYPES } from '../constants/_constants';
import util from 'util/_util';
import {walletManMiddleware_logger as log} from '../../log/logHelper.js'

const madWallet = new MadWallet();

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
                    initMadWallet(action.payload, storeAPI.dispatch); break;
                case MIDDLEWARE_ACTION_TYPES.ADD_WALLET_FROM_KEYSTORE:
                    addWalletFromKeystore(action.payload, storeAPI.dispatch); break;
                case MIDDLEWARE_ACTION_TYPES.ADD_NEXT_HD_WALLET:
                    addNextHDWallet(storeAPI.dipatch); break;
                default: break;
            }
            // Do anything here: pass the action onwards with next(action),
            // or restart the pipeline with storeAPI.dispatch(action)
            // Can also use storeAPI.getState() here
            return next(action)
        }
    }
}

/**
 * WalletManagerMiddleware parsing of SET_VAUL_TO_STATE action
 * @param { Object } initPayload - Payload called from SET_VAULT_TO_STATE
 */
function initMadWallet(initPayload, dispatch) {
    return new Promise(res => {
        log.debug("Initiating MadWallet Instance & Syncronizing to Redux State. . .")
        // Extract all wallets from payload and add to MadWallet.Accounts
        let internalAccountAdds = []; // Internal HD Accounts
        let externalAccountAdds = []; // Externally imported accounts
        for (let walletType in initPayload.wallets) {
            for (let wallet of initPayload.wallets[walletType]) {
                if (walletType === "internal") {
                    internalAccountAdds.push([wallet.privK, wallet.curve, wallet.name]);
                } else { // else, is an external wallet
                    externalAccountAdds.push([wallet.privK, wallet.curve, wallet.name]);
                }
            }
        }
        // Aggregate accounts to add into all accountAdds with marker for internal vs external
        let allToAdd = [...internalAccountAdds, ...externalAccountAdds];
        let addedPromises = [];
        allToAdd.forEach((addition) => { addedPromises.push(madWallet.Account.addAccount(addition[0], addition[1])); }); // [privK, curveInt] })
        let internalWallets = [];
        let externalWallets = [];

        Promise.all(addedPromises).then(() => {
            // After adding inject internal || external based on match in previous array to redux state with constructed wallet objects
            madWallet.Account.accounts.forEach(account => {
                let signerKeyToUse = parseInt(account.MultiSigner.curve) === 1 ? "secpSigner" : "bnSigner";  // Key to use under MultiSigner for this account to get privK
                let privK = account.MultiSigner[signerKeyToUse].privK; // Note the privK
                let filteredPk;
                let match = allToAdd.filter(addition => {
                    filteredPk = addition[0];
                    return addition[0] === privK
                })[0]; // Match privK to current account from MadNetWallet.accounts
                // Construct the wallet based off of data creation from madwallet -- We let mad wallet build this data and then store it back to state 
                let walletObj = util.wallet.constructWalletObject(
                    match[2], // 2nd index in initial parsing gives us the name,
                    account.MultiSigner[signerKeyToUse].privK,
                    account.address,
                    signerKeyToUse === "bnSigner" ? util.wallet.curveTypes.BARRETO_NAEHRIG : util.wallet.curveTypes.SECP256K1,
                    internalAccountAdds.filter(addition => addition[0] === privK).length === 1 // is this an internal wallet?
                );
                if (walletObj.isInternal) {
                    internalWallets.push(walletObj);
                } else {
                    externalWallets.push(walletObj);
                }
            });
            log.debug("Dispatching set vault state -- Post Mad Wallet Init")
            dispatch({ type: VAULT_ACTION_TYPES.SET_WALLETS_STATE, payload: { internal: internalWallets, external: externalWallets } })
            res(true);
        });
    });
}

function addWalletFromKeystore() {

}

function addNextHDWallet() {

}

// function walletAdditonHandler() {}

/**
 * Return reference to active madWallet instance
 * @returns 
 */
export function getMadWalletInstance() {
    return madWallet;
}