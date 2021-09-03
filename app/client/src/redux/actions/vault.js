import { VAULT_ACTION_TYPES } from 'redux/constants/_constants';
import util from 'util/_util'; 

/** After a vault has been decrypted call this actions for any wallets to be added to the internal keyring 
 * Internal keyring wallets are validated for existence and stored inside the vault
 * @param {Object} walletData - Object comprised of the following data points
 * @param {String} walletData.name - The name of the wallet - extracted from the vault
 * @param {String} walletData.pubAdd - The public address of this wallet - extracted from the vault
 * @param {String} walletData.pubKey - The public key of this wallet - extracted from the vault
 * @param {String} walletData.privKey - 
 * 
*/
export function addInternalWalletToState(walletData) {
    return async function (dispatch) {
        // CAT_TODO: Update from passed walletData;
        const walletName = "A New Wallet";
        const privKey = "PRIVK_TEST_STATE_STRING"
        const pubKey = "PUBK_TEST_STATE_STRING";
        const pubAdd = "PUBADD_TEST_STATE_STRING"
        // Generate the wallet object
        const walletToAdd = util.wallet.generateStateWalletObject(walletName, privKey, pubKey, pubAdd);
        dispatch({type: VAULT_ACTION_TYPES.ADD_INTERNAL_WALLET, payload: walletToAdd });
    }
}