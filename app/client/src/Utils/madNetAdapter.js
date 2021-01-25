class MadNetAdapter {
    constructor(cb, wallet, provider) {
        this.cb = cb;
        this.wallet = wallet;
        this.provider = provider;
        this.connected = false;

        this.pending = [];
        this.pendingLocked = false;
    }

    async init() {
        try {
            await this.cb.call(this, "wait", "Connecting to Mad Network");
            await this.wallet.Rpc.setProvider(this.provider)
            this.connected = true;
            await this.cb.call(this, "success")
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }
    // Create the transaction from user inputed TxOuts
    async createTx(txOuts, changeAddress) {
        await this.cb.call(this, "wait", "Sending transacton");
        for await (let txOut of txOuts) {
            try {
                switch (txOut.type) {
                    case "VS":
                        await this.wallet.Transaction.createValueStore(txOut.fromAddress, txOut.value, txOut.toAddress, txOut.bnCurve ? 2 : 1)
                        break;;
                    case "DS":
                        await this.wallet.Transaction.createDataStore(txOut.fromAddress, txOut.index, txOut.duration, txOut.rawData)
                        break;;
                    default:
                        throw new Error("Invalid TxOut type");
                }
            }
            catch (ex) {
                await this.wallet.Transaction._reset();
                await this.cb.call(this, "error", String(ex));
                return
            }
        }
        try {
            let tx = await this.wallet.Transaction.sendTx(changeAddress["address"], changeAddress["bnCurve"]);
            await this.cb.call(this, "success", { "type": "warning", "msg": "Pending: " + this.trimTxHash(tx) });
            this.pending.push(tx)
            this.monitorPending();
        }
        catch (ex) {
            await this.wallet.Transaction.reset();
            await this.cb.call(this, "error", String(ex));
        }
    }

    // Monitor the pending transaction the was sent
    async monitorPending() {
        try {
            if (this.pendingLocked || this.pending.length < 1) {
                return;
            }
            this.pendingLocked = true;
            let pending = this.pending.slice(0)
            for (let i = 0; i < pending.length; i++) {
                try {
                    await this.wallet.Rpc.getMinedTransaction(pending[i]);
                    await this.cb.call(this, "success", { "type": "success", "msg": "Mined: " + this.trimTxHash(pending[i]) });
                    this.pending.splice(i, 1);
                }
                catch (ex) {
                    continue;
                }
            }
            if (this.pending.length > 0) {
                await this.sleep(5000)
                this.pendingLocked = false;
                await this.monitorPending();
            }
            this.pendingLocked = false;
            return;
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    // Trim txHash for readability
    trimTxHash(txHash) {
        try {
            let trimmed = "0x" + txHash.substring(0, 6) + "..." + txHash.substring(txHash.length - 6)
            return trimmed
        }
        catch (ex) {
            throw String(ex)
        }
    }

    // Delay for the monitor
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
export default MadNetAdapter;