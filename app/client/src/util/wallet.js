import { v4 as uuidv4 } from 'uuid';
import { utilsWallet_logger as log } from 'log/logHelper';
const bip39 = require('bip39');
var HDKey = require('hdkey');

// Switch to hdkey not ethererum-cryptography ^

// CAT_TODO: Subject to change, not JSdoccing yet
export function generateStateWalletObject(walletName, privKey, pubKey, pubAdd) {
    return {
        name: "A New Wallet",
        pubAdd: "PUBADD_TEST_STATE_STRING",
        pubKey: "PUBK_TEST_STATE_STRING",
        privkey: "PRIVK_TEST_STATE_STRING",
        initId: uuidv4(), // Initialized State ID for quick client side identification
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
    const node = hdChain.derive("m'/44'/60'/0'/0" + String(nodeNum));
    log.debug(`A Wallet Node has been requested`, { nodeNumber: nodeNum, node: node, nodeExtendedPrivKey: node.privateExtendedKey });
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
        res(getHDWalletNodeFromHDChain(hdChain, nodeNum));
    })
}
