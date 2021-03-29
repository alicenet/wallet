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
        }
        this.cb(this, false, false);
    }
    async handleFile(event) {
        try {
            let newData = await this.uploadFile(event);
            this.cb(this, 'keystore', newData)
            return newData;
        }
        catch (ex) {
            this.cb(this, 'err', String(ex))
        }
    }
    uploadFile(event) {
        return new Promise((resolve, reject) => {
            let file = event.target.files[0];
            let newData = { 'filename': false, 'keystore': false };
            newData["filename"] = file.name.substring(0, 16);
            let reader = new FileReader();
            reader.readAsText(file);
            reader.onabort = () => { reject(new Error({ "keystore": "Aborted loading keystore file" })) }
            reader.onerror = () => { reject(new Error({ "keystore": "Error loading keystore file" })) }
            reader.onload = () => {
                newData["keystore"] = reader.result
                resolve(newData)
            };
        });
    }
}

module.exports = Accounts;