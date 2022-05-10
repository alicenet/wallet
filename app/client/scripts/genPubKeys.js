/**
 * Derives public keys from a private key using the internal utilities and AliceNetWalletJS
 */

const alicenetjs = require('alicenetjs');

const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

main();

const aliceNetWallet = new alicenetjs();

async function main() {
    console.log('\n\x1b[33mEnter privK to derive secp256k1 and Barreto-Naehrig curves from:');
    rl.question("\x1b[36mPrivate Key: \x1b[0m", async enteredKey => {

        if(!enteredKey.match(/[0-9a-f]+/i)) {
            return sigKillThrow("Private Key must be hexadecimal.");
        }
        
        if (enteredKey.length !== 64) {
            return sigKillThrow("Private Key must be 64 long.");
        }
        
        // Add secp256k1 as wallet 0
        await aliceNetWallet.Account.addAccount(enteredKey, 1);
        
        // Add BN as wallet 1
        await aliceNetWallet.Account.addAccount(enteredKey, 2);

        console.log("\n\x1b[36mSECP256K1       Derived Public Key: \x1b[0m", aliceNetWallet.Account.accounts[0].address);
        console.log("\x1b[36mBARRETO-NAEHRIG Derived Public Key: \x1b[0m", aliceNetWallet.Account.accounts[1].address, '\n');

        process.exit();

    })
}

function sigKillThrow(msg) {
    console.log('\n\x1b[31m' + msg + "\n");
    process.exit();
}