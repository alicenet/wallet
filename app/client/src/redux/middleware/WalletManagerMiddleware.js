import MadWallet from 'madwalletjs';
import { vaultActionTypes } from '../constants/vault';
import { walletManMiddleware_logger as log } from 'log/logHelper';
import util from 'util/_util';

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

/**
 * WalletManagerMiddleware parsing of SET_VAUL_TO_STATE action
 * @param { Object } vaultPayload - Payload called from SET_VAULT_TO_STATE
 */
function setVaultToStateHandler(vaultPayload) {
    // Extract all wallets from payload and add to MadWallet.Accounts
    let accountAdds = [];
    for (let walletType in vaultPayload.wallets) {
        for (let wallet of vaultPayload.wallets[walletType]) {
            let pKey = wallet[0].privateKey.toString('hex'); // Wallet should be an array of [HDKey<WalletNode>, curveType] 
            let curve = wallet[1];
            accountAdds.push(madWallet.Account.addAccount(pKey, util.wallet.curveStringToNum(curve)));
        }
    }
    Promise.all(accountAdds).then( () => {
        log.debug("SET_VAULT_TO_STATE handled by WalletManagerMiddleware: MadWallet.Account.accounts:", madWallet.Account.accounts);
    })
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