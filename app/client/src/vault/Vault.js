const bip39 = require('bip39');
const { HDKey } = require("ethereum-cryptography/hdkey");

class Vault {

    static generateHdMnemonic() {
        const mnemonic = bip39.generateMnemonic();
        return mnemonic;
    }

    static generateHDSeedFromMnemonic(mnemonic) {
        const seedBytes = await bip39.mnemonicToSeed();
        const seed = seedBytes.toString('hex');
        return seed;
    }

    static getHDWalletFromMnemonic(mnemonic) {
        let hdSeed = this.generateHDSeedFromMnemonic(mnemonic);
        
    }

}

const hdkey = HDKey.fromMasterSeed(Buffer.from(seed, "hex"));

const childkey = hdkey.derive("m'/44'/60'/0'/0");

console.log({
    mnemonic: mnemonic,
    seed: seed,
    hdKey: hdkey,
    key0: childkey.privateExtendedKey,
})

return mnemonic;
