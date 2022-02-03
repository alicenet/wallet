import electronStoreMessenger from './electronStoreMessenger';
import { electronStoreHelper_logger as log } from 'log/logHelper';
import utils from 'util/_util';
import { utils as web3Utils } from 'web3'
import { v4 } from 'uuid';

/** A utility module to assist in reading and writing from the secure-electron-store using the elctronStoreMessenger
 * without directly utilizing the pub/sub interface provided by it, but rather it's sync-mimicking abstractions
 */

///////////////////////
/* Function Requires */
///////////////////////
const endPhrase = (paramName, funcName) => ("'" + paramName + "' is required when calling " + funcName + "() handle nulls outside of this helper!");

const _requireKey = (key, funcName) => {
    if (!key) {
        throw new Error(endPhrase("key", funcName));
    }
};

const _requireValue = (value, funcName) => {
    if (!value) {
        throw new Error(endPhrase("value", funcName));
    }
};

const _requirePass = (pass, funcName) => {
    if (!pass) {
        throw new Error(endPhrase("password", funcName));
    }
};

const _requireKeyValue = (funcName, key, value) => {
    _requireKey(key, funcName);
    _requireValue(value, funcName);
};

const _requireKeyPassword = (funcName, key, password) => {
    _requireKey(key, funcName);
    _requirePass(password, funcName);
};

const _requireKeyValuePassword = (funcName, key, value, password) => {
    _requireKey(key, funcName);
    _requireValue(value, funcName);
    _requirePass(password, funcName);
};

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
};

/**
 * Write encrypted value to secure-electron-store -- Stringify JSON first
 * @param { String } key - Key to use for the respectively supplied value
 * @param { String } value - Value you wish to write to the secure-electron-store -- JSON should be stringified
 */
async function writeEncryptedValueToStore(key, value, password) {
    _requireKeyValuePassword("writeEncryptedValueToStore", key, value, password);
    log.debug("Secure K:V write request sent to electronStoreMessenger => " + key + " : " + value);
    return await electronStoreMessenger.writeEncryptedToStore(key, value, password);
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
            }
            else {
                log.debug("Plain K:V read from electron store => " + key + " : " + value);
            }
            res(value);
        });
    });
}

/**
 * Read an encrypted value from the secure-electron-store
 * @param { String } key - Key for the value you wish to fetch
 * @param { String } password - Password that was initially used to encrypt the value
 * @returns Returns decrypted value or object with object.error on an error.
 */
function readEncryptedValueFromStore(key, password) {
    _requireKeyPassword("readEncryptedValueFromStore", key, password);
    return new Promise(res => {
        electronStoreMessenger.readEncryptedFromStore(key, password, async (err, keyOfValue, value) => {
            if (err) {
                log.error(err);
                res({ error: err });
            }

            log.debug("Plain K:V decrypted from electron store => " + keyOfValue + " : " + value);
            res(value);
        })
    });
}

/**
 * Requests a direct copy of the user file be made by the electron store messenger
 */
async function backupStore() {
    return new Promise(res => {
        electronStoreMessenger.backupStore((channel, response) => {
            res(!!response.success);
        });
    });
}

function completelyDeleteElectronStore() {
    electronStoreMessenger.deleteStore();
}

export const electronStoreUtilityActions = {
    completelyDeleteElectronStore: completelyDeleteElectronStore,
    writePlainValueToStore: writePlainValueToStore,
    writeEncryptedToStore: writeEncryptedValueToStore,
    readPlainValueFromStore: readPlainValueFromStore,
    readEncryptedValueFromStore: readEncryptedValueFromStore,
    backupStore: backupStore,
}

//////////////////////////////////////
/* Abstracted Common Store Actions  */ // Functions that remove the need to know the keys for common stored items
/////////////////////////////////////

/**
 *
 * @param { Object } walletsAsObject
 * @property { Array } walletsAsObject.internal - Array of internal wallets with {name:} only
 * @property { Array } walletsAsObject.external - Array of externak wallets with {name: , privK:, curve:  }
 */
function _genVaultObjectString(mnemonic, hdCurveType, hdWalletCount = 1, walletsAsObject) {
    return JSON.stringify({
        mnemonic: mnemonic,
        hd_wallet_count: hdWalletCount,
        hd_wallet_curve: hdCurveType,
        wallets: walletsAsObject
    });
}

/** Full abstraction of vault generation -- Returns mnemonic
 * @param { String } mnemonic - Mnemonic to generate the vault based off of :: Should be a mnemonic that has been verified by the vault owner,
 * @param { String } password - Passphrase to cipher the vault with :: A hash will also be stored for pre-flights and admin actions as "preflightHash",
 * @param { String } curve - One of: "secp256k1", "secp" or "barreto-naehrig", "bn"
 * @returns { Array[passwordHash, firstWalletNode] } - Returns a hash of the password used to encrypt the vault and the firstWalletNode if the vault has been created successfully
 */
function createNewSecureHDVault(mnemonic, password, curveType = "secp256k1") {
    return new Promise(async res => {
        let wu = utils.wallet; // Wallet utils shorthand
        // Generate keccak256 hash of the password -- Returned for any preflights if desired
        let passwordHash = web3Utils.keccak256(password);
        // Get seedBytes => chain => firstWalletNode
        let seedBytes = await wu.getSeedBytesFromMnemonic(mnemonic);
        let hdChain = wu.getHDChainFromSeedBytes(seedBytes);
        let firstWalletNode = wu.getHDWalletNodeFromHDChain(hdChain, 0);

        let wallets = {
            internal: [{ name: "Main Wallet" }], // When storing internal wallets the only key we need to store in their name
            external: [],
        };

        // Create the vault object string
        const vaultObjectString = _genVaultObjectString(mnemonic, curveType, 1, wallets);

        await writeEncryptedValueToStore("vault", vaultObjectString, password);
        log.debug('A new secure vault as key "vault" has been saved to the store.');
        res([passwordHash, firstWalletNode]);
    });
}

/**
 * Unlocks and returns the current Vault object -- Should be called after a preflightHash check has been done
 * @param { String } password -- Password used to secure vault -- Should be verified with preflightHash check first
 * @returns { Object } - JSON Vault Object or .error if error occurs
 */
function unlockAndGetSecuredHDVault(password) {
    return new Promise(async res => {
        try {
            let vault = await readEncryptedValueFromStore("vault", password);
            if (vault.error) { res({ error: vault.error }) }
            res(JSON.parse(vault));
        } catch (ex) {
            res({ error: ex });
        }
    });
}

/**
 * Updates the current vault store wallets with a sent wallet state
 * @param { Object } vaultState
 * @returns
 */
function updateVaultWallets(password, newWalletState) {
    return new Promise(async res => {
        let vault = JSON.parse(await readEncryptedValueFromStore("vault", password)); // Get current vault for settings
        let vaultObjectString = _genVaultObjectString(vault.mnemonic, vault.hd_wallet_curve, newWalletState.internal.length, newWalletState); // Inject new wallets
        let written = await writeEncryptedValueToStore("vault", vaultObjectString, password); // Write it
        res(written);
    });
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
 * Opt out users store keystores under the key "optOutStores" as an array of  Objects with name and keystore, and optionally curve as values
 * This adds an optout keystore to the list of keystores in the electron state
 * Opt out keystores are given a UUID so that they can be acted on within the UI, eg for removal.
 * @param {Object} walletsToSync - Collection of wallet objects to write to "optOutStores"
 */
async function addOptOutKeystore(ksString, walletName) {
    // First see if optOuts exist, if not make them
    let currentKeystores = await readPlainValueFromStore("optOutStores");
    // If not existent, set as empty array and add to it
    if (currentKeystores.error && currentKeystores.error === "Key is not in secure-electron-storage!") {
        currentKeystores = [];
    }
    // Add new keystore with a uid
    currentKeystores.push({ name: walletName, keystore: ksString, id: v4() });
    // Write the updated keystores
    writePlainValueToStore("optOutStores", currentKeystores);
}

/**
 * Remove an optOutKeystore from the electron store state
 * @param { String } addressToRemove - The address to remove
 */
async function removeOptoutKeystore(addressToRemove) {
    let currentKeystores = await readPlainValueFromStore("optOutStores");
    // Find the keystore index by parsing the currentKeystores until address is part of the keystoreString
    let targetKeystoreIndex = (() => {
        for (let i = 0; i < currentKeystores.length; i++) {
            let store = currentKeystores[i];
            if (store.keystore.indexOf(addressToRemove) !== -1) {
                return i;
            }
        }
    })();
    currentKeystores.splice(targetKeystoreIndex, 1);
    writePlainValueToStore("optOutStores", currentKeystores);
}

/**
 * Returns an array of all optout keystores
 */
function checkForOptoutStores() {
    return new Promise(async res => {
        let keystores = await readPlainValueFromStore("optOutStores")
        if (keystores.error && keystores.error === "Key is not in secure-electron-storage!") {
            res(false);
        }
        else if (keystores.error) {
            throw new Error(keystores.error);
        }
        else {
            res(keystores);
        }
    })
}

/**
 * Fetch the currently stored preflight hash from the electron store
 * @returns { Promise <String>} - Return preflight hash as a string
 */
function getPreflightHash() {
    return new Promise(async res => {
        res(await readPlainValueFromStore("preflightHash"));
    });
}

/**
 * Check if user has vault -- Returns boolean if they do
 */
function checkIfUserHasVault() {
    return new Promise(async res => {
        let hasVault = await readPlainValueFromStore("vault");
        if (!!hasVault.error) {
            log.warn("A potential error occurred when checking for user vault :: Unfound key is normal. err => ", hasVault.error);
            res(false);
        }
        else { res(true) }
    });
}

/**
 * Check input password against stored preflight hash
 */
function checkPasswordAgainstPreflightHash(password) {
    return new Promise(async res => {
        const preflightHash = await readPlainValueFromStore("preflightHash");
        if (preflightHash.error) {
            log.warn("Error fetching preflight hash from store. Are you sure you should be calling this function? Verify that the application is in a state that this hash should exist.");
        }
        const pwHash = web3Utils.keccak256(password);
        res(preflightHash === pwHash);
    })
}

/** -- Write configuration values to electron store
 * @param { Object } configValues
 * @property { String } configValues.mad_net_chainID - Mad net chain id to save
 * @property { String } configValues.mad_net_provider - Mad net chain id to save
 * @property { String } ethereum_provider - Mad net chain id to save
 * @property { String } registry_contract_address - Mad net chain id to save
 */
function storeConfigurationValues(configValues) {
    let updateObject = {
        mad_net_chainID: configValues.mad_net_chainID,
        mad_net_provider: configValues.mad_net_provider,
        ethereum_provider: configValues.ethereum_provider,
        registry_contract_address: configValues.registry_contract_address,
        advanced_settings: configValues.advanced_settings,
        hide_generic_tooltips: configValues.hide_generic_tooltips,
    }
    writePlainValueToStore('configuration', updateObject);
}

/**
 * Read the configuration values from the electron store
 * @returns { Object } - The read configuration object
 */
async function readConfigurationValues() {
    return await readPlainValueFromStore('configuration');
}

export const electronStoreCommonActions = {
    addOptOutKeystore: addOptOutKeystore,
    checkForOptoutStores: checkForOptoutStores,
    checkIfUserHasVault: checkIfUserHasVault,
    checkPasswordAgainstPreflightHash: checkPasswordAgainstPreflightHash,
    createNewSecureHDVault: createNewSecureHDVault,
    getPreflightHash: getPreflightHash,
    readConfigurationValues: readConfigurationValues,
    removeOptoutKeystore: removeOptoutKeystore,
    storeConfigurationValues: storeConfigurationValues,
    storePreflightHash: storePreflightHash,
    unlockAndGetSecuredHDVault: unlockAndGetSecuredHDVault,
    updateVaultWallets: updateVaultWallets,
}