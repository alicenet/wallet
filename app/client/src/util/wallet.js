import Web3 from 'web3';
import { v4 as uuidv4 } from 'uuid';
import { utilsWallet_logger as log } from 'log/logHelper';
import store from 'redux/store/store'
const bip39 = require('bip39');
const MadNetWalletJS = require('madwalletjs')
var HDKey = require('hdkey');

/** Creates a raw state wallet object from a wallet_name and private key
 * Internal keyring wallets are validated for existence and stored inside the vault
 * @param { String } walletName - The name of the wallet - extracted from the vault
 * @param { String } privK - The private key of this wallet - extracted from the vault
 * @param { Int } curve - Curve type  
 */
export async function generateBasicWalletObject(walletName, privK, curve) {
    // Derive public key and public address to state for ease of use
    return {
        name: walletName,
        address: curve === curveTypes.SECP256K1 ? await getSecp256k1FromPrivKey(privK) : await getBNfromPrivKey(privK),
        curve: curve,
        privK: privK,
        stateId: uuidv4(), // Initialized State ID for quick client side identification -- Not stored elsewhere, can be used as key in map() if needed
    }
}

/**
 * Generate and return a bip39 pnemonic as a string
 * @returns { String } A Bip39 Mnemonic as a string 
 */
export function generateBip39Mnemonic() {
    const mnemonic = bip39.generateMnemonic();
    log.debug(`A Bip39 Mnemonic has been generated`, { mnemonic: mnemonic });
    return mnemonic;
}

/**
 * Gets Uint8Array ofr SeedBytes from mnemonic
 * @param {String} mnemonic 
 * @returns { Promise<Uint8Array> } - Promise with Uint8Array of representing SeedBytes
 */
export function getSeedBytesFromMnemonic(mnemonic) {
    return new Promise(async res => {
        const seedBytes = await bip39.mnemonicToSeed(mnemonic);
        log.debug(`A Bip39 Mnemonic has been used to get seedBytes`, { seedBytes: seedBytes });
        res(seedBytes);
    })
}

/**
 * Returns respective HDKeyChain of a mnemonic phrase 
 * @param { String } mnemonic - mnemonic phrase separated by ' '
 * @returns { HDKey } - HDKeyChain
 */
export function getHDChainFromSeedBytes(seedBytes) {
    const hdChain = HDKey.fromMasterSeed(seedBytes);
    log.debug(`An HD Chain has been derrived from seed bytes`, { hdChain: hdChain });
    return hdChain;
}

/**
 * @param { Object } hdChain - The HD Keychain -- Should be derrived from mnemonic via util.wallet.getHDChainFromMnemonic()
 * @returns { HDKey } - HD Keychain's requested Node
 */
export function getHDWalletNodeFromHDChain(hdChain, nodeNum) {
    const derivationPath = "m/44'/60'/0'/0/" + String(nodeNum);
    const node = hdChain.derive(derivationPath);
    log.debug(`A Wallet Node has been requested`, {
        nodeNumber: nodeNum,
        derivationPath: derivationPath,
        node: node,
        nodeExtendedPrivKey: node.privateExtendedKey,
        privK: node.privateKey.toString('hex'),
        pubK: node.publicKey.toString('hex'),
    });
    return node;
}

/**
 * Quickly get passed HDChain from Mnemonic using wallet utilities from utils/wallet.js
 * @param { String } mnemonic - mnemonic phrase separated by ' '
 * @returns {Promise<HDKey>} - Promise that resolves to requested HD Chain
 */
export function streamlineHDChainFromMnemonic(mnemonic) {
    return new Promise(async res => {
        const seedBytes = await getSeedBytesFromMnemonic(mnemonic);
        res(getHDChainFromSeedBytes(seedBytes));
    })
}

/**
 * Quickly get a derivative wallet from a Mnemonic using wallet utilities from utils/wallet.js
 * @param { String } mnemonic - mnemonic phrase separated by ' '
 * @param { Integer } nodeNum - The node to derrive from the derivation path: m'/44'/60'/0'/<node>
 * @returns {Promise<HDKey>} - Promise that resolves to the requested HD wallet node
 */
export function streamLineHDWalletNodeFromMnemonic(mnemonic, nodeNum) {
    return new Promise(async res => {
        const seedBytes = await getSeedBytesFromMnemonic(mnemonic);
        const hdChain = getHDChainFromSeedBytes(seedBytes);
        const walletNode = getHDWalletNodeFromHDChain(hdChain, nodeNum);
        res(walletNode);
    })
}

// let seedBytes = wu.getSeedBytesFromMnemonic(mnemonic);
// let hdChain = wu.getHDChainFromSeedBytes(seedBytes);
// let firstWalletNode = wu.getHDWalletNodeFromHDChain(hdChain, 0);

/**
 * Quickly get a set of derivative wallets from a Mnemonic using wallet utilities from utils/wallet.js
 * @param { String } mnemonic - mnemonic phrase separated by ' '
 * @param { Array.<Number> } nodeNums - The nodes to derrive from the derivation path: m'/44'/60'/0'/<node>
 * @returns { Array.<HDKey> } - Promise that resolves to the requested HD wallet nodes
 */
export function streamLineHDWalletNodesFromMnemonic(mnemonic, nodeNums) {
    return new Promise(async res => {
        const seedBytes = await getSeedBytesFromMnemonic(mnemonic);
        const hdChain = getHDChainFromSeedBytes(seedBytes);
        let derrivedWallets = [];
        nodeNums.forEach((nodeNumber) => {
            derrivedWallets.push(getHDWalletNodeFromHDChain(hdChain, nodeNumber));
        })
        res(derrivedWallets);
    })
}

/**
* Unlock a keystore using web3.utils
 * @param {*} keystore - Keystore JSON to unlock
 * @param {*} password - Password to use to unlock the json
 */
export function unlockKeystore(keystore, password) {
    try {
        let web3 = new Web3();
        let storedCurve = keystore.curve ? keystore.curve : curveTypes.SECP256K1; // Falback to SECP256K1 if no stored curve
        let unlocked = web3.eth.accounts.wallet.decrypt([keystore], password);
        let firstWallet = unlocked["0"]; // We only care about the 0 entry for the keystore
        firstWallet.curve = storedCurve; // Reinject the noted curve to the wallet
        return firstWallet;
    } catch (ex) {
        log.error("Error unlocking keystore", ex);
        return { error: ex }
    }
}

/**
 * Generate and return a new JSON blob representing the data for a keystore.
 * @param { Boolean } asBlob - Return keystore as a blob? 
 * @param { String } password - Password to secure the keystore with 
 * @param { CurveType } curve - Curve if desired, default to type 1
 * @returns { Blob || JSON String } - JSON Blob || Json String
 */
export async function generateKeystore(asBlob, password, curve = curveTypes.SECP256K1) {
    let web3 = new Web3();
    let wallet = web3.eth.accounts.wallet.create(1)
    web3.eth.accounts.wallet.add(wallet[0])
    let ks = web3.eth.accounts.wallet.encrypt(password)
    let keystore = ks[0];
    // Note the curve && address if BN -- Curve gets removed on reads
    if (curve === curveTypes.BARRETO_NAEHRIG) {
        keystore["address"] = await getBNfromPrivKey(strip0x(wallet[0].privateKey));;
        keystore["curve"] = curveTypes.BARRETO_NAEHRIG
    }
    let ksJSONBlob = new Blob([JSON.stringify(keystore, null, 2)]);
    return asBlob ? ksJSONBlob : keystore;
}

/**
 * Generated a keystore object from a privateKey
 * @param {*} privK 
 * @param {*} password 
 * @param {*} curve 
 * @param {*} asBlob
 */
export async function generateKeystoreFromPrivK(privK, password, curve = curveTypes.SECP256K1, asBlob) {
    let web3 = new Web3();
    web3.eth.accounts.wallet.add(privK);
    let ks = web3.eth.accounts.wallet.encrypt(password);
    let keystore = ks[0];
    // Note the curve && address if BN -- Curve gets removed on reads
    if (curve === curveTypes.BARRETO_NAEHRIG) { 
        keystore["address"] = await getBNfromPrivKey(privK);
        keystore["curve"] = curveTypes.BARRETO_NAEHRIG 
    }
    let ksJSONBlob = new Blob([JSON.stringify(keystore, null, 2)]);
    return asBlob ? ksJSONBlob : keystore;
}

/** Standardized Wallet Data Object for State Storage and General Use
 * @param { Object } walletDetails - Object composed of wallet details
 * @param { String } walletDetails.name - Name of the wallet ( For UI )
 * @param { String } walletDetails.privK - Private Key for the wallet
 * @param { String } walletDetails.address - Address for this wallet ( For UI )
 * @param { String } walletDetauls.curve - Curve used to derrive public key from privK
 * @param { Boolean } walletDetauls.isInternal - Is this wallet derrives from the Mnemonic HD Chain?
 * @returns  { Object } - Wallet Object
 */
export const constructWalletObject = (name, privK, address, curve, isInternal) => {
    if (!name || !privK || !address || !curve || typeof isInternal === "undefined") {
        throw new Error("Attempting to generate standardized wallet object without correct parameters. Verify all function inputs.")
    }
    return { name: name, privK: privK, address: address, curve: curve, isInternal: isInternal }
};

/**
 * Strip 0x prefix from eth bases addresses and keys
 * @param { String } pKeyOrAddress 
 */
export const strip0x = (pKeyOrAddress) => {
    if (typeof pKeyOrAddress !== "string") { throw new Error("Only strings should be passed to strip0x(), handle this externally.") }
    // Only proceed if has prefix
    if (pKeyOrAddress[0] === "0" && pKeyOrAddress[1] === "x") {
        return pKeyOrAddress.slice(2, pKeyOrAddress.length);
    }
    return pKeyOrAddress;
}

/**
 * Accepts two strings of eth addresses, strips them of 0x prefix, and lowercases them
 * Returns true if both strings match
 */
export function compareAddresses(address1, address2) {
    if (typeof address1 !== "string" || typeof address2 !== "string") { log.warn("Only strings should be passed to compareAddresses()."); return false; }
    let stripped1 = strip0x(address1).toLowerCase();
    let stripped2 = strip0x(address2).toLowerCase();
    return stripped1 === stripped2;
}

// Returns a wallet name from state by address or null of it isn't available
export function getWalletNameFromAddress(address) {
    let walletState = store.getState().vault.wallets
    let wallets = [...walletState.internal, ...walletState.external]
    let found = null;
    wallets.forEach(w => {
        if (w.address === address) {
            found = w.name;
        }
    })
    return found;
}

// Returns true if the user has the corresponding wallet in the vault for a given public address
export function userOwnsAddress(address) {
    let walletState = store.getState().vault.wallets
    let wallets = [...walletState.internal, ...walletState.external]
    let owns = wallets.some(w => {
        return w.address === address;
    })
    return owns;
}

// Returns true if the sent address is the first address in the user's collections
export function isPrimaryWalletAddress(address) {
    let walletState = store.getState().vault.wallets
    let wallets = [...walletState.internal, ...walletState.external]
    if (wallets.length === 0) { return false };
    return wallets[0].address === address;
}

/**
 *  Returns the corresponding vault wallet object for a given address
 * @param { String } address - Address of the wallet to fetch in the vault
 * */
export function getVaultWalletByAddress(address) {
    let walletState = store.getState().vault.wallets
    let wallets = [...walletState.internal, ...walletState.external];
    let foundWallet = wallets.filter(wallet => wallet.address === address)?.[0];
    return !foundWallet ? false : foundWallet;
}

/**
 * Return the secp256k1 derived public key for a given private key
 * @returns {String} - secp256k1 derived public key string
 */
export async function getSecp256k1FromPrivKey(privK) {
    let walletInstance = new MadNetWalletJS();
    await walletInstance.Account.addAccount(privK, curveTypes.SECP256K1);
    return walletInstance.Account.accounts[0].address;
}

/**
 * Return the barreto-naehrig derived public key for a given private key
 * @returns {Promise<String>} - barreto-naehrig derived public key string
 */
export async function getBNfromPrivKey(privK) {
    let walletInstance = new MadNetWalletJS();
    await walletInstance.Account.addAccount(privK, curveTypes.BARRETO_NAEHRIG);
    return walletInstance.Account.accounts[0].address;
}

/**
 * Returns both the secp256k1 and barreto-naehrig derived public keys for a given private key
 * @param { String } privK 
 * @returns {Array[{String}, {String}]} - An array of strings: [secp256k1PublicAddress, bnPublicAddress]
 */
export async function getPubKeysFromPrivKey(privK) {
    return await Promise.all([getSecp256k1FromPrivKey(privK), getBNfromPrivKey(privK)]);
}

export const curveTypes = {
    SECP256K1: 1,
    BARRETO_NAEHRIG: 2,
}
