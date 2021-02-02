class MadNetAdapter {
    constructor(cb, wallet, provider) {
        this.cb = cb;
        this.wallet = wallet;
        this.provider = provider;
        this.connected = false;

        this.pending = [];
        this.pendingLocked = false;

        this.blocks = [];
        this.blocksStarted = false;
        this.currentBlock = 0;
        this.blocksLocked = false;
        this.blocksId = false;

        this.transactionHash = false;
        this.transaction = false;
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

    // Monitor new blocks, lazy loading
    async monitorBlocks() {
        if (!this.blocksStarted) {
            this.blocksStarted = true;
        }
        try {
            if (this.blocksLocked) {
                return;
            }
            this.blocksLocked = true;
            try {
                let currentBlock = await this.wallet.Rpc.getBlockNumber();
                if (this.currentBlock != currentBlock) {
                    let blockDiff = (currentBlock - this.currentBlock);
                    if (blockDiff > 5) {
                        blockDiff = 5;
                    }
                    for (let i = 0; i < blockDiff; i++) {
                        let blockHeader = await this.wallet.Rpc.getBlockHeader(currentBlock - ((blockDiff - i) - 1));
                        this.blocks.unshift(blockHeader);
                    }
                    this.currentBlock = currentBlock;
                }
                this.blocks = this.blocks.slice(0, 5);
            }
            catch (ex) {
                await this.cb.call(this, "error", String("Could not update latest block"));
            }
            await this.cb.call(this, "success")
            this.blocksLocked = false
            this.blocksId = setTimeout(() => { this.monitorBlocks() }, 5000);
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    // Reset block monitor
    async blocksReset() {
        clearTimeout(this.blocksId);
        this.blocks = [];
        this.blocksStarted = false;
        this.currentBlock = 0;
        this.blocksLocked = false;

    }

    async viewBlock(height) {
        await this.cb.call(this, "wait", "Getting Block");
        try {
            let blockHeader = await this.wallet.Rpc.getBlockHeader(height);
            await this.cb.call(this, "notify", blockHeader);
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    async viewTransaction(txHash, changeView) {
        await this.cb.call(this, "wait", "Getting Transaction");
        try {
            this.transactionHash = txHash;
            let Tx = await this.wallet.Rpc.getMinedTransaction(txHash);
            this.transaction = Tx["Tx"];
            if (changeView) {
                await this.cb.call(this, "view", "txExplorer");
            }
            else {
                await this.cb.call(this, "success"); 
            }
        }
        catch (ex) {
            this.transactionHash = false;
            this.transaction = false;
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