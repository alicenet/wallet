/* Code for prepping events and dependencies for the secure-electon-store */
import { readConfigRequest, readConfigResponse, writeConfigRequest } from "secure-electron-store";
import { electronStoreMessenger_logger as log, ADDITIONAL_LOG_OPTS } from 'log/logHelper';
import { v4 as uuidv4 } from 'uuid';
import util from 'util/_util';

import { scrypt } from 'scrypt-js'; // External -- scrypt-js -- scrypt is not in current version of node -- Change to supplied crypto module if node16+ used
import crypto from 'crypto';


/**
 * Middleware to mimic syncronous-non-event based access to secure-electron-store 
 * Additionally provides services to sub/unsub from electron store events to assist preventing state malfunction if event-notices are needed
 * Components that digest this module must unsubscribe from any subscribed keys to prevent state issues across re-renders
 */
class StoreMessenger {

    constructor() {
        this.subscribers = {};
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
     * @returns 
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
     * Subscribe to an event key -- Returns a v4uuid to use for unsubscription of this key
     * @param {String} key - The key to be notified of events on
     * @param {Func} callback - Callback that will be used upon any requests to the respected key
     * @param {string} callback.key - Key that was requested from the secure-electron-store
     * @param {string} callback.value - Value that was requested from the secure-electron-store
     * @param {Bool} forceUnsub - Wrap callback to additionally immediately force unsubcription after being called
     * @returns {String} v4uuid to use for unsubscription of this key
     */
    subscribeToKey(key, callback, forceUnsub) {
        let id = uuidv4(); // Create the uid for the subscription
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
     * Passthrough abstraction for secure-electron-store's .send(writeConfigRequest)
     * @param {String} key - Key to use for the value store 
     * @param {*} value - Value to be stored
     */
    writeToStore(key, value) {
        window.api.store.send(writeConfigRequest, key, value);
        if (util.generic.stringHasJsonStructure(value)) {
            log.debug('JSON Like Structure written as value with key: ' + key, JSON.parse(value));
        } else {
            log.debug('Plain Value written to store with key: ' + key + " and value:", value);
        }
    }

    async writeEncryptedToStore(key, value, password) {
        const algorithm = 'aes-256-cbc';

        const salt = crypto.randomBytes(512);
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

        });

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
        this.subscribeToKey(key, callback, true);
        window.api.store.send(readConfigRequest, key);
    }

    /**
     * Passthrough abstraction for secure-electron-store's .send(readConfigRequest) to simulate syncronous reading of an encrypted value store object
     * @param {String} key - Key to read from the secure store
     * @param {String} password - Password that was used for the cipher
     * @param {Func} callback - (error, key, value) => {...} :: key = key that was checked, value = respective value of the key   
     */
    readEncryptedFromStore(key, password, callback = (key, decryptedValue) => { }) {
        // Subscribe internally and read the key as the storeMessenger
        this.readFromStore(key, (key, value) => {
            this.decipherEncryptedValue(value, password, (error, decryptedValue) => {
                callback(error, key, decryptedValue);
            })
        }, true);
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

} catch (ex) {
    log.warn("It appears electron store is not available, you may be running in vanilla browser. You won't have access to storage this way.")
}