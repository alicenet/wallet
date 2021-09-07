import electronStoreMessenger from './electronStoreMessenger';

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
    electronStoreMessenger.writeToStore(key, value);
}

/**
 * Write encrypted value to secure-electron-store
 * @param { String } key - Key to use for the respectively supplied value
 * @param { String } value - Value you wish to write to the secure-electron-store 
 */
function writeEncryptedValueToStore(key, value, password) {
    _requireKeyValuePassword("writeEncryptedValueToStore", key, value, password);
    electronStoreMessenger.writeEncryptedToStore(key, value, password);
}

/**
 * Read a plaintext value from the secure-electron-store -- 
 * @param { String } key - Key for the value you wish to fetch 
 * @returns Returns the value for the corresponding key
 */
function readPlainValueFromStore(key) {
    _requireKey("readPlainValueFromStore", key);
    return new Promise(res => {
        electronStoreMessenger.readFromStore(key, (keyOfValue, value) => { 
            if (!value) { res({error: "Key is not in secure-electron-storage!"})}
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
        return value;
    })
}

export const utilityActons = {
    writePlainValueToStore: writePlainValueToStore,
    writeEncryptedToStore: writeEncryptedValueToStore,
    readPlainValueFromStore: readPlainValueFromStore,
    readEncryptedValueFromStore: readEncryptedValueFromStore,
}

//////////////////////////////////////
/* Abstracted Common Store Actions  */
/////////////////////////////////////

// TBD