import MadWallet from 'madwalletjs';
import { MIDDLEWARE_ACTION_TYPES, VAULT_ACTION_TYPES } from '../constants/_constants';
import { walletManMiddleware_logger as log } from 'log/logHelper';
import util from 'util/_util';
import { constructWalletObject, buildVaultStateObject } from 'redux/reducers/vault';

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
    // Extract all wallets from payload and add to MadWallet.Accounts
    let internalAccountAdds = []; // Internal HD Accounts
    let externalAccountAdds = []; // Externally imported accounts
    for (let walletType in initPayload.wallets) {
        for (let wallet of initPayload.wallets[walletType]) {
            if (walletType === "internal") {
                internalAccountAdds.push([wallet.privK, util.wallet.curveStringToNum(wallet.curve), wallet.name]);
            } else {
                externalAccountAdds.push([wallet.privK, util.wallet.curveStringToNum(wallet.curve), wallet.name]);
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
        // After adding inject internal || external based on match in previous array
        madWallet.Account.accounts.forEach(account => {
            let signerKeyToUse = parseInt(account.MultiSigner.curve) === 1 ? "secpSigner" : "bnSigner";  // Key to use under MultiSigner for this account to get privK
            let privK = account.MultiSigner[signerKeyToUse].privK;
            // Compare each account for its existance in internal vs external -- If it's within internal keys assume it's internal else external
            let isInternal = internalAccountAdds.filter(addition => addition[0] === privK).length === 1;
            let walletName = allToAdd.filter(addition => addition[0] === privK)[0][2]; // 2nd index in initial parsing gives us the name
            console.log(account);
            let walletObj = constructWalletObject({
                name: walletName,
                privK: account.MultiSigner[signerKeyToUse].privK,
                address: account.address,
                curve: signerKeyToUse === "bnSigner" ? "barreto-naehrig" : "secp256k1",
                isInternal: isInternal,
            })
            if (walletObj.isInternal) {
                internalWallets.push(walletObj);
            } else {
                externalWallets.push(walletObj);
            }
        });
        dispatch({ type: VAULT_ACTION_TYPES.SET_WALLETS_STATE, payload: { internal: internalWallets, external: externalWallets } })
    });

}

function walletAdditonHandler() {

}

/**
 * Return reference to active madWallet instance
 * @returns 
 */
export function getMadWalletInstance() {
    return madWallet;
}