import MadWallet from 'madwalletjs';
import { vaultActionTypes } from '../constants/vault';
import { walletManMiddleware_logger as log } from 'log/logHelper';

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
                case vaultActionTypes.SET_VAULT_TO_STATE:
                    setVaultToStateHandler(action.payload); break;
                case vaultActionTypes.ADD_INTERNAL_WALLET:
                case vaultActionTypes.ADD_EXTERNAL_WALLET:
                    walletAdditonHandler(); break;
            }
            // Do anything here: pass the action onwards with next(action),
            // or restart the pipeline with storeAPI.dispatch(action)
            // Can also use storeAPI.getState() here
            return next(action)
        }
    }
}

function setVaultToStateHandler(vaultPayload) {
    console.log(vaultPayload)
    // Extract all wallets from payload and add to MadWallet.Accounts
    let allPKeysToAdd = [];
    for (let walletType in vaultPayload.wallets) {
        let pKey = vaultPayload.wallets[walletType].privateKey;
        allPKeysToAdd.push(pKey);
        // TODO: START HERE -- Address curve being pushed to wallets array in state and constructing wallets in MadWallet Object here for all pushed wallets
    }
}

function walletAdditonHandler() {

}