const Web3 = require('web3');

class Accounts {
    constructor(cb, wallet) {
        this.cb = cb;
        this.wallet = wallet;
    }
    // Decrypt keystore file with password or use PrivK and curve and attempt to add to MadWalletJS
    async addAccount(keystore, passwordOrPrivateKey, curve) {
        this.cb(this, 'wait', 'Loading Account...')
        await this.sleep(500)
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
            this.cb(this, 'err', "Could not load account");
        }
        this.cb(this, false, false);
    }

    async createAccount(password, curve) {
        this.cb(this, 'wait', 'Creating Account...')
        try {
            let web3 = new Web3();
            // Below two vars currently unused
            let wallet = web3.eth.accounts.wallet.create(1)
            let acct = await web3.eth.accounts.wallet.add(wallet[0]) 
            let ks = await web3.eth.accounts.wallet.encrypt(password)
            ks = ks[0]
            if (curve) {
                ks["curve"] = 2
            }
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([JSON.stringify(ks, null, 2)], {
                type: "application/json"
            }));
            a.setAttribute("download", "MadNet-keystore-" + Date.now() + ".json");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        catch (ex) {
            console.log(ex)
        }
        this.cb(this, 'closeModal', false)
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

    // Delay for the loader
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default Accounts;