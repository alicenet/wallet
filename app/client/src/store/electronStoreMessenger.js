/* Code for prepping events and dependencies for the secure-electon-store */
import { readConfigRequest, readConfigResponse, writeConfigRequest, deleteConfigRequest, deleteConfigResponse } from "secure-electron-store";

import { electronStoreMessenger_logger as log, ADDITIONAL_LOG_OPTS } from 'log/logHelper';
import util from 'util/_util';

import { scrypt } from 'scrypt-js'; // External -- scrypt-js -- scrypt is not in current version of node -- Change to supplied crypto module if node16+ used
import crypto from 'crypto';

// IPC Channels -- Direct from custom IPC module in parent electron project -- These MUST match.
// Can't import outside of client source
const writeBakFileRequest = "WriteBakFile-Request";
const writeBakFileResponse = "WriteBakFile-Response";

/**
 * Middleware to mimic synchronous-non-event based access to secure-electron-store
 * Additionally provides services to sub/unsub from electron store events to assist preventing state malfunction if event-notices are needed
 * Components that digest this module must unsubscribe from any subscribed keys to prevent state issues across re-renders
 */
class StoreMessenger {

    /**
     * @typedef { Object } VaultStorageObject - An encrypted ValueStore JSON Object
     * @property { String } algorithm - Algorithm
     * @property { Uint8Array } iv - Initialization vector for the encrypted value
     * @property { String } cipherText - 
     * @property { String } salt -
     */

    constructor() {
        this.subscribers = {}; // Subscribers for secure-electron-store
        this.bakSubsribers = {}; // Subscribers for BackupStore
        this.storeAvailable = !!window && !!window.api && !!window.api.store
        if (this.storeAvailable) {
            log.debug("DEBUG: Store files located in: ", window.api.store.path)
        } else {
            log.warn("secure-electron-store not available. Fallback only available in debug mode set accordingly.");
            if (!util.generic.isDebug) {
                throw new Error("When running application without a store, you must be in debug mode to proceed. Set .env accordingly.")
            }
        }
        this.fakeStore = {};
    }

    /**
     * Returns a shortened uid for readability in logging
     * @param {String} uid - The uid to shorten
     * @returns {String} 
     */
    _shortId(uid) {
        return uid.substring(0, 18);
    }

    /**
     * Return standardized object for an encrypted store value to use within secure-electron-store
     * @param { String } algorithm 
     * @param { Uint8Array } iv 
     * @param { String } cipherText 
     * @param { String } salt
     * @returns { VaultStorageObject }
     */
    _createEncryptedValueStoreJSONString(algorithm, iv, cipherText, salt) {
        return JSON.stringify({
            algorithm: algorithm,
            cipherText: cipherText,
            iv: iv,
            salt: salt,
        });
    }

    /**
     * Core event cycle -- Used by the external secure-electron-store to pass events down to subscribers
     * @param {String} key - electron-secure-store key that was just requested
     * @param {*} value - electron-secure-store value that was just requested
     */
    notifyEvent(key, value) {
        for (let sub in this.subscribers) {
            let keyIdx = this.subscribers[sub].keys.indexOf(key);
            if (keyIdx !== -1) {
                this.subscribers[sub].callbacks[keyIdx](key, value);
            }
        }
    }

    /**
     * Core event cycle -- Used by external SecureBackup to pass events down to subscribers -- Default to writeBakFileResponse until further needs arise
     * @param {*} channel 
     * @param {*} response 
     */
    notifyBackupEvent(channel, response) {
        for (let sub in this.bakSubsribers) {
            let keyIdx = this.bakSubsribers[sub].channels.indexOf(channel);
            if (keyIdx !== -1) {
                this.bakSubsribers[sub].callbacks[keyIdx](channel, response);
            }
        }
    }

    /**
     * Calls the underlying IPC method to make a direct copy of the MadWalletUser file
     * This file can act as a manual replacement backup if any issues occur - See BackupStore.js in app/electron
     * @param cb - Callback to call withs (args) => {} from BackupStore event
     */
    async backupStore(cb = (args) => { }) {
        this.subscribeToBackupEvent(writeBakFileResponse, cb, true);
        window.api.storeBak.send(writeBakFileRequest);
    }

    /** Completely delete the electron store and all key/values -- Primarily for debugging */
    deleteStore() {
        log.info("About to completely delete the electron store -- I certainly hope this was on purpose.");
        window.api.store.send(deleteConfigRequest);
    }

    /**
     * Subscribe to an event key -- Returns a v4uuid to use for unsubscription of this key
     * @param {String} key - The key to be notified of events on
     * @param {Func} callback - Callback that will be used upon any requests to the respected key
     * @param {string} callback.key - Key that was requested from the secure-electron-store
     * @param {string} callback.value - Value that was requested from the secure-electron-store
     * @param {Bool} forceUnsub - Wrap callback to additionally immediately force unsubcription after being called
     * @returns {String} v4uuid to use for unsubscription of this key
     */
    subscribeToKey(key, callback, forceUnsub) {
        let id = util.generic.genUuidv4(); // Create the uid for the subscription
        if (ADDITIONAL_LOG_OPTS.LOG_ELECTRON_MESSENGER_SUBSCRIBER_EVENTS) { log.debug(`${this._shortId(id)} has subscribed to ${key}`); }
        // Wrap the callback to immediately unsub after the value is fetched
        let theCb = forceUnsub ? (
            (key, value) => {
                callback(key, value);
                this.unsubscribe(id);
            }
        ) : callback;
        // Update subscriptions
        this.subscribers[id] = { keys: [key], callbacks: [theCb] }
        return id;
    }

    /**
     * Subscribe to a channel for the BackupStore
     * @param { String } channel - Channel name to subscribe to
     * @param { Function } callback - Callback to run when the response is served
     * @returns { String } - v4uuid to use for unsubscription of this channel
     */
    subscribeToBackupEvent(channel, callback, forceUnsub) {
        let id = util.generic.genUuidv4(); // Create the uid for the subscription
        if (ADDITIONAL_LOG_OPTS.LOG_ELECTRON_MESSENGER_SUBSCRIBER_EVENTS) { log.debug(`${this._shortId(id)} has subscribed to backup channel ${channel}`); }
        // Wrap the callback to immediately unsub after the value is fetched
        let theCb = forceUnsub ? (
            (channel, response) => {
                callback(channel, response);
                this.unsubscribe(id);
            }
        ) : callback;
        // Update subscriptions
        this.bakSubsribers[id] = { channels: [channel], callbacks: [theCb] }
        return id;
    }

    /**
     * Subscribe to an array of event keys -- Returns a v4uuid to use for unsubscription of this key set
     * @param {Array.Strings} keys - The key to be notified of events on
     * @param {Func} callback - ([keys], [values]) => {} :: Where keys are the keys events have happened on, and values are their latest values
     */
    // subscribeToKeys(keys, callback) { } // TBD if needed

    /**
      * Unsubscribe from any events associated with the uuid
      * @param {String} uid - The v4uuid associated with the subscription :: Generally returned from subscribeToKey() or handled internally
    */
    unsubscribe(uid) {
        if (ADDITIONAL_LOG_OPTS.LOG_ELECTRON_MESSENGER_SUBSCRIBER_EVENTS) { log.debug(`${this._shortId(uid)} has unsubscribed from ${this.subscribers[uid].keys}`); }
        delete this.subscribers[uid];
    }

    /**
      * Unsubscribe from any events associated with the uuid on the bakSubscriptions list
      * @param {String} uid - The v4uuid associated with the subscription :: Generally returned from subscribeToBackupEvent() or handled internally
    */
    unsubscribeFromBackup(uid) {
        if (ADDITIONAL_LOG_OPTS.LOG_ELECTRON_MESSENGER_SUBSCRIBER_EVENTS) { log.debug(`${this._shortId(uid)} has unsubscribed from backup channel: ${this.bakSubsribers[uid].channels}`); }
        delete this.bakSubsribers[uid];
    }

    /**
     * Passthrough abstraction for secure-electron-store's .send(writeConfigRequest)
     * @param {String} key - Key to use for the value store 
     * @param {*} value - Value to be stored
     */
    writeToStore(key, value) {
        if (!this.storeAvailable) { return this._writeToFakeStore(key, value) }
        window.api.store.send(writeConfigRequest, key, value);
        if (util.generic.stringHasJsonStructure(value)) {
            log.debug('JSON Like Structure written as value with key: ' + key, JSON.parse(value));
        } else {
            log.debug('Plain Value written to store with key: ' + key + " and value:", value);
        }
    }

    _writeToFakeStore(key, value) {
        this.fakeStore[key] = value;
        if (util.generic.stringHasJsonStructure(value)) {
            log.debug('FAKESTORE: JSON Like Structure written as value with key: ' + key, JSON.parse(value));
        } else {
            log.debug('FAKESTORE: Plain Value written to store with key: ' + key + " and value:", value);
        }
    }

    writeEncryptedToStore(key, value, password) {
        return new Promise(async res => {

            const algorithm = 'aes-256-cbc';

            const salt = crypto.randomBytes(64);
            let sKey = await scrypt(new Buffer.from(password), new Buffer.from(salt), 1024, 8, 1, 32, () => { });

            crypto.randomFill(new Uint8Array(16), (err, iv) => {
                if (err) throw err;
                // Once we have the key and iv, we can create and use the cipher...
                const cipher = crypto.createCipheriv(algorithm, sKey, iv);

                let encrypted = '';
                cipher.setEncoding('hex');

                cipher.on('data', (chunk) => encrypted += chunk);
                cipher.on('end', () => {
                    let storageJson = this._createEncryptedValueStoreJSONString(algorithm, iv, encrypted, salt);
                    log.debug('Encrypted Value prepared for storage with key: ' + key + " and JSON: ", JSON.parse(storageJson));
                    this.writeToStore(key, storageJson)
                });

                cipher.write(value);
                cipher.end();

                res(true);
            });

        })

    }

    /**
     * Decipher an encrypted value store object
     * @param {JSON} encryptedJsonObj - JSON Object returned from secure-electron-store
     * @param {String} encryptedJsonObj.algorithm - Algorithm to use for deciphering
     * @param { String } encryptedJsonObj.cipherText - The cipherText to decrypt
     * @param { String } encryptedJsonObj.iv - iv to use for deceryption
     * @param {Func} callback - (decrypted) => {...} :: decrypted value from the encryptedJsonObj   
     */
    async decipherEncryptedValue(encryptedJsonObj, password, cb = (err, decrypted) => { }) {
        const cipherText = encryptedJsonObj.cipherText;
        const algorithm = encryptedJsonObj.algorithm;
        const iv = new Uint8Array(Object.values(encryptedJsonObj.iv));
        const key = await scrypt(Buffer.from(password), encryptedJsonObj.salt.data, 1024, 8, 1, 32);

        let decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = "";

        try {
            decipher.on('readable', (chunk) => {
                while (null !== (chunk = decipher.read())) {
                    decrypted += chunk.toString('utf8');
                }
            });
            decipher.on('end', () => {
                log.debug('Decryption requested and completed for following encryptionStore: ', encryptedJsonObj);
                cb(null, decrypted)
            });

            decipher.write(cipherText, 'hex');
            decipher.end();
        } catch (ex) {
            cb(ex, null);
        }

    }

    /**
     * Passthrough abstraction for secure-electron-store's .send(readConfigRequest) to simulate syncronous reading
     * @param {String} key - Key to read from the secure store
     * @param {Func} callback - (key, value) => {...} :: key = key that was checked, value = respective value of the key   
     */
    readFromStore(key, callback = (key, value) => { }) {
        if (!this.storeAvailable) { return this._readFromFakeStore(key, callback) }
        this.subscribeToKey(key, callback, true);
        window.api.store.send(readConfigRequest, key);
    }

    /** Shim for fake store reads */
    _readFromFakeStore(key, callback = (key, value) => { }) {
        let value = this.fakeStore[key];
        log.debug("FAKE KEY VALUE READ: " + key);
        return callback(key, value);
    }

    /**
     * Passthrough abstraction for secure-electron-store's .send(readConfigRequest) to simulate syncronous reading of an encrypted value store object
     * @param {String} key - Key to read from the secure store
     * @param {String} password - Password that was used for the cipher
     * @param {Func} callback - (error, key, value) => {...} :: key = key that was checked, value = respective value of the key   
     */
    readEncryptedFromStore(key, password, callback = (key, decryptedValue) => { }) {
        if (!this.storeAvailable) { return this._readEncryptedFromFakeStore(key, password, callback) }
        // Subscribe internally and read the key as the storeMessenger
        this.readFromStore(key, (key, value) => {
            this.decipherEncryptedValue(value, password, (error, decryptedValue) => {
                callback(error, key, decryptedValue);
            })
        }, true);
    }

    _readEncryptedFromFakeStore(key, password, callback = (key, decryptedValue) => { }) {
        let value = JSON.parse(this.fakeStore[key]);
        this.decipherEncryptedValue(value, password, (error, decryptedValue) => {
            callback(error, key, decryptedValue);
        })
    }

}

/* The global ( _and only_ ) storeMessenger */
const storeMessenger = new StoreMessenger()
export default storeMessenger;

try {

    // Core secure-electron-store event for responses
    window.api.store.onReceive(readConfigResponse, function (args) {
        let val = args.value;
        // If value is JSON, make object
        let isJson = util.generic.stringHasJsonStructure(val);
        if (isJson) {
            let [err, value] = util.generic.safeJsonParse(val);
            if (!!err) {
                log.error("Error parsing JSON from assumed JSON String :> " + val + " <: in electron store for following key : " + args.key);
                val = args.value; // Fallback to args.value
            }
            val = value;
        }
        storeMessenger.notifyEvent(args.key, val);
    });

    window.api.store.onReceive(deleteConfigResponse, function (args) {
        if (args.success) {
            log.info("Electron store successfully deleted.")
        }
    });

    window.api.storeBak.onReceive(writeBakFileResponse, function (args) {
        storeMessenger.notifyBackupEvent(writeBakFileResponse, args);
    });


} catch (ex) {
    log.warn("It appears electron store is not available, you may be running in vanilla browser. You won't have access to storage this way.")
}