const Web3 = require('web3');

class Accounts {
    constructor(cb, wallet) {
        this.cb = cb;
        this.wallet = wallet;
    }
       // Decrypt keystore file with password or use PrivK and curve and attempt to add to MadWalletJS
       async addAccount(keystore, passwordOrPrivateKey, curve) {
        this.cb(this, 'wait', 'Loading Wallet...')
        try {
            if (keystore) {
                let curve = JSON.parse(keystore)["curve"]
                if (!curve) {
                    curve = 1;
                }
                delete keystore["curve"];
                let web3 = new Web3();
                let account = web3.eth.accounts.decrypt(keystore, passwordOrPrivateKey);
                await this.wallet.Account.addAccount(account.privateKey, curve);
            }
            else {
                if (!curve) {
                    curve = 1;
                }
                else {
                    curve = 2;
                }
                await this.wallet.Account.addAccount(passwordOrPrivateKey, curve);
            }
        }
        catch (ex) {
            this.cb(this, 'err', String(ex))
        }
        this.cb(this, false, false);
    }
}

module.exports = Accounts;