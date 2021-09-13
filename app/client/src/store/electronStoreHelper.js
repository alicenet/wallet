import electronStoreMessenger from './electronStoreMessenger';
import { electronStoreHelper_logger as log } from 'log/logHelper';
import utils from 'util/_util';
import { utils as web3Utils } from 'web3'

/** A utility module to assist in reading and writing from the secure-electron-store using the elctronStoreMessenger 
 * without directly utilizing the pub/sub interface provided by it, but rather it's sync-mimicking abstractions
 */

///////////////////////
// Function Requires //
///////////////////////
const endPhrase = (paramName, funcName) => ("'" + paramName + "' is required when calling " + funcName + "() handle nulls outside of this helper!");

const _requireKey = (key, funcName) => {
    if (!key) { throw new Error(endPhrase("key", funcName)) }
}

const _requireValue = (value, funcName) => {
    if (!value) { throw new Error(endPhrase("value", funcName)) }
}

const _requirePass = (pass, funcName) => {
    if (!pass) { throw new Error(endPhrase("password", funcName)) }
}

const _requireKeyValue = (funcName, key, value) => {
    _requireKey(key, funcName);
    _requireValue(value, funcName);
}

const _requireKeyPassword = (funcName, key, password) => {
    _requireKey(key, funcName);
    _requirePass(password, funcName);
}

const _requireKeyValuePassword = (funcName, key, value, password) => {
    _requireKey(key, funcName);
    _requireValue(value, funcName);
    _requirePass(password, funcName);
}

////////////////////////////
/* Electron Store Actions */
////////////////////////////

/**
 * Write non-encrypted value to secure-electron-store
 * @param { String } key - Key to use for the respectively supplied value
 * @param { String } value - Value you wish to write to the secure-electron-store 
 */
function writePlainValueToStore(key, value) {
    _requireKeyValue("writePlainValueToStore", key, value);
    log.debug("Plain K:V write request sent to to electronStoreMessenger => " + key + " : " + value);
    electronStoreMessenger.writeToStore(key, value);
}

/**
 * Write encrypted value to secure-electron-store -- Stringify JSON first
 * @param { String } key - Key to use for the respectively supplied value 
 * @param { String } value - Value you wish to write to the secure-electron-store -- JSON should be stringified 
 */
function writeEncryptedValueToStore(key, value, password) {
    _requireKeyValuePassword("writeEncryptedValueToStore", key, value, password);
    log.debug("Secure K:V write request sent to electronStoreMessenger => " + key + " : " + value);
    electronStoreMessenger.writeEncryptedToStore(key, value, password);
}

/**
 * Read a plaintext value from the secure-electron-store -- 
 * @param { String } key - Key for the value you wish to fetch 
 * @returns {Promise<*>} Returns Promise<the value for the corresponding key>
 */
function readPlainValueFromStore(key) {
    _requireKey("readPlainValueFromStore", key);
    return new Promise(res => {
        electronStoreMessenger.readFromStore(key, (keyOfValue, value) => {
            if (!value) { res({ error: "Key is not in secure-electron-storage!" }) }
            if (typeof value === "object" && utils.generic.stringHasJsonStructure(JSON.stringify(value))) {
                log.debug("Plain K:V read from electron store => " + key + " : ", value);
            } else {
                log.debug("Plain K:V read from electron store => " + key + " : " + value);
            }
            res(value)
        });
    })
}

/**
 * Read an encrypted value from the secure-electron-store
 * @param { String } key - Key for the value you wish to fetch 
 * @param { String } password - Password that was initially used to encrypt the value
 * @returns Returns decrypted value or object with object.error on an error.
*/
function readEncryptedValueFromStore(key, password) {
    _requireKeyPassword("readEncryptedValueFromStore", key, password);
    electronStoreMessenger.readEncryptedFromStore(key, password, async (err, keyOfValue, value) => {
        if (err) { console.error(err); return { error: err }; }
        log.debug("Plain K:V decrypted from electron store => " + keyOfValue + " : " + value);
        return value;
    })
}

export const electronStoreUtilityActons = {
    writePlainValueToStore: writePlainValueToStore,
    writeEncryptedToStore: writeEncryptedValueToStore,
    readPlainValueFromStore: readPlainValueFromStore,
    readEncryptedValueFromStore: readEncryptedValueFromStore,
}

//////////////////////////////////////
/* Abstracted Common Store Actions  */ // Functions thats remove the need to know the keys for common stored items
/////////////////////////////////////

/** Full abstraction of vault generation -- Returns mnemonic
 * @param { String } mnemonic - Mnemonic to generate the vault based off of :: Should be a mnemonic that has been verified by the vault owner,
 * @param { String } password - Passphrase to cipher the vault with :: A hash will also be stored for pre-flights and admin actions as "preflightHash",    
 * @returns { Array[passwordHash, firstWalletNode] } - Returns a hash of the password used to encrypt the vault and the firstWalletNode if the vault has been created successfully 
 */
function createNewSecureHDVault(mnemonic, password) {
    return new Promise(async res => {
        let wu = utils.wallet; // Wallet utils shorthand
        // Generate keccak256 hash of the password -- Returned for any preflights if desired
        let passwordHash = web3Utils.keccak256(password);
        // Get seedBytes => chain => firstWalletNode
        let seedBytes = wu.getSeedBytesFromMnemonic(mnemonic);
        let hdChain = wu.getHDChainFromSeedBytes(seedBytes);
        let firstWalletNode = wu.getHDWalletNodeFromHDChain(hdChain, 0);
        // Create the vault object string
        const vaultObjectString = JSON.stringify({
            mnemonic: mnemonic,
            hd_wallet_count: 1,
            wallets: {
                external: [],
            }
        });
        await writeEncryptedValueToStore("vault", vaultObjectString, password);
        log.debug('A new secure vault as key "vault" has been saved to the store.')
        res([passwordHash, firstWalletNode]);
    })
}

/**
 * Store preflight hash as plain value to the electron-store
 * @param { String } hashAsString - Hash to be stored as a string
 * @returns { Boolean }
 */
function storePreflightHash(hashAsString) {
    writePlainValueToStore("preflightHash", hashAsString);
    return true;
}

/**
 * Fetch the currently stored preflight hash from the electron store
 * @returns { Promise <String>} - Return preflight hash as a string
 */
function getPreflightHash() {
    return new Promise(async res => {
        res(await readPlainValueFromStore("preflightHash"));
    })
}

export const electronStoreCommonActions = {
    createNewSecureHDVault: createNewSecureHDVault,
    storePreflightHash: storePreflightHash,
    getPreflightHash: getPreflightHash,
}