import { v4 as uuidv4 } from 'uuid';
import utils from 'util/_util';
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
 * @returns String - Bip39 Mnemonic as string 
 */
export async function generateBip39Mnemonic() {
    const mnemonic = bip39.generateMnemonic();
    if (utils.generic.isDebug()) { console.log(`A Bip39 Mnemonic has been generated`, { mnemonic: mnemonic }) }
    return mnemonic;
}

export async function getSeedBytesFromMnemonic(mnemonic) {
    const seedBytes = await bip39.mnemonicToSeed(mnemonic);
    if (utils.generic.isDebug()) { console.log(`A Bip39 Mnemonic has been used to get seedBytes`, { seedBytes: seedBytes }) }
    return seedBytes;
}

/**
 * Returns respective HDKeyChain of a mnemonic phrase 
 * @param {string} mnemonic - mnemonic phrase separated by ' '  
 */
export async function getHDChainFromSeedBytes(seedBytes) {
    const hdChain = HDKey.fromMasterSeed(seedBytes);
    /*
    let seedByteString = seedBytes.toString('hex');
    console.log(seedByteString);
    let seedBytes2 = Buffer.from(seedByteString, 'hex');
    console.log({
        seedBytes: seedBytes,
        seedByteString: seedByteString,
        seedBytes2: seedBytes2,
    })
    */
    if (utils.generic.isDebug()) { console.log(`An HD Chain has been derrived from seed bytes`, { hdChain: hdChain }) }
    return hdChain;
}

/**
 * @param { Object } hdChain - The HD Keychain -- Should be derrived from mnemonic via util.wallet.getHDChainFromMnemonic()
 * @param { Integer } nodeNum - The node to derrive from the derivation path: m'/44'/60'/0'/<node>
 * @returns { Object } - HD Keychain's requested Node
 */
export async function getHDWalletNodeFromHDChain(hdChain, nodeNum) {
    const node = hdChain.derive("m'/44'/60'/0'/0" + String(nodeNum));
    if (utils.generic.isDebug()) {
        console.log(`A Wallet Node has been requested`, {
            nodeNumber: nodeNum,
            node: node,
            nodeExtendedPrivKey: node.privateExtendedKey,
        })
    }
    return node;
}