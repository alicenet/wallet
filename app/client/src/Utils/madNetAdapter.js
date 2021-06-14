const BigInt = require("big-integer");

class MadNetAdapter {
    constructor(cb, wallet, provider) {
        this.cb = cb;
        this.wallet = wallet;
        this.provider = provider;
        this.connected = false;
        this.failed = false;
        this.MaxDataStoreSize = 2097152;
        this.BaseDatasizeConst = 376;

        // Transaction panel
        this.txOuts = [];
        this.changeAddress = { "address": "", "bnCurve": false };
        this.pendingTx = false;
        this.pendingLocked = false;

        // Block explorer panel
        this.blocks = [];
        this.blocksMaxLen = 10
        this.blocksStarted = false;
        this.currentBlock = 0;
        this.blocksLocked = false;
        this.blocksId = false;
        this.mbAttempts = 0;

        // Tx explorer panel
        this.transactionHash = false;
        this.transaction = false;
        this.transactionHeight = false;

        // DataStore explorer panel
        this.dsRedirected = false;
        this.dsSearchOpts = { "address": "", "offset": "", "bnCurve": false };
        this.dsDataStores = [];
        this.dsActivePage = 1;
        this.dsView = [];

    }

    // Initialize the adapter
    async init() {
        try {
            await this.cb.call(this, "wait", "Connecting to Mad Network");
            await this.wallet.Rpc.setProvider(this.provider)
            this.connected = true;
            this.failed = false;
            await this.cb.call(this, "success")
        }
        catch (ex) {
            this.failed = true;
            await this.cb.call(this, "error", String(ex));
        }
    }



    // Create the transaction from user inputed TxOuts
    async createTx() {
        if (this.pendingTx) {
            await this.cb.call(this, "error", String("Waiting for pending transaction to be mined"));
            return
        }
        await this.cb.call(this, "wait", "Sending transacton");
        for await (let txOut of this.txOuts) {
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
                this.txOuts = [];
                this.changeAddress = {};
                await this.wallet.Transaction._reset();
                await this.cb.call(this, "error", String(ex));
                return
            }
        }
        await this.sendTx();
    }

    async sendTx() {
        try {
            await this.wallet.Transaction._createTxIns(this.changeAddress["address"], this.changeAddress["bnCurve"])
            await this.wallet.Transaction.Tx._createTx();
            let tx = await this.wallet.Rpc.sendTransaction(this.wallet.Transaction.Tx.getTx())
            await this.backOffRetry('sendTx', true)
            await this.cb.call(this, "success")
            this.pendingTx = tx;
            await this.cb.call(this, "success", { "type": "warning", "msg": "Pending: " + this.trimTxHash(tx) });
            await this.wallet.Transaction._reset();
            this.monitorPending();
        }
        catch (ex) {
            await this.backOffRetry('sendTx')
            if (this['sendTx-attempts'] > 5) {
                this.txOuts = [];
                this.changeAddress = {};
                await this.wallet.Transaction._reset();
                await this.backOffRetry('sendTx', true)
                await this.cb.call(this, "error", String(ex));
                return
            }
            await this.sleep(this['sendTx-timeout']);
            this.sendTx();
        }
    }

    // Monitor the pending transaction the was sent
    async monitorPending() {
        let tx = this.pendingTx;
        try {
            await this.wallet.Rpc.getMinedTransaction(tx);
            await this.backOffRetry('pending-' + JSON.stringify(tx), true)
            this.pendingTx = false;
            await this.cb.call(this, "success", { "type": "success", "txHash": tx, "msg": "Mined: " + this.trimTxHash(tx) });
        }
        catch (ex) {
            await this.backOffRetry('pending-' + JSON.stringify(tx))
            if (this['pending-' + JSON.stringify(tx) + "-attempts"] > 30) {
                this.pendingTx = false;
                await this.backOffRetry('pending-' + JSON.stringify(tx), true)
                await this.cb.call(this, "error", String(ex));
                return
            }
            await this.sleep(this["pending-" + JSON.stringify(tx) + "-timeout"])
            await this.monitorPending(tx)
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
                let tmpBlocks = this.blocks ? this.blocks.slice(0) : []
                let currentBlock = await this.wallet.Rpc.getBlockNumber();
                if (this.currentBlock !== currentBlock) {
                    let blockDiff = (currentBlock - this.currentBlock);
                    if (blockDiff > this.blocksMaxLen) {
                        blockDiff = this.blocksMaxLen;
                    }
                    for (let i = 0; i < blockDiff; i++) {
                        let blockHeader = await this.wallet.Rpc.getBlockHeader(currentBlock - ((blockDiff - i) - 1));
                        tmpBlocks.unshift(blockHeader);
                    }
                    this.currentBlock = currentBlock;
                    this.blocks = tmpBlocks;
                }
                tmpBlocks = tmpBlocks.slice(0, this.blocksMaxLen);
                this.blocks = tmpBlocks;
                await this.backOffRetry("monitorBlocks", true)
            }
            catch (ex) {
                await this.backOffRetry("monitorBlocks")
                if (this["monitorBlocks-attempts"] > 10) {
                    await this.cb.call(this, "error", String("Could not update latest block"));
                    return
                }
            }
            await this.cb.call(this, "success")
            this.blocksLocked = false
            this.blocksId = setTimeout(() => { try { this.monitorBlocks() } catch (ex) { console.log(ex) } }, this["monitorBlocks-attempts"] == 1 ? 5000 : this["monitorBlocks-timeout"]);
        }
        catch (ex) {
            console.log(ex)
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

    // Get block for modal
    async viewBlock(height) {
        await this.cb.call(this, "wait", "Getting Block");
        try {
            let blockHeader = await this.wallet.Rpc.getBlockHeader(height);
            await this.cb.call(this, "notify", blockHeader);
            await this.backOffRetry("vB", true);
            return blockHeader
        }
        catch (ex) {
            await this.backOffRetry("vB");
            if (this['vB-attempts'] > 10) {
                await this.cb.call(this, "error", String(ex));
                return
            }
            await this.sleep(this["vB-timeout"])
            this.viewBlock(height)
        }
    }

    // Get block for modal
    async viewBlockFromTx(txHash) {
        await this.cb.call(this, "wait", "Getting Block");
        try {
            let txHeight = await this.wallet.Rpc.getTxBlockHeight(txHash);
            this.transactionHeight = txHeight;
            let blockHeader = await this.wallet.Rpc.getBlockHeader(txHeight);
            await this.cb.call(this, "notify", blockHeader);
            await this.backOffRetry("viewBlock", true)
            return blockHeader
        }
        catch (ex) {
            await this.backOffRetry("viewBlock")
            if (this["viewBlock-attempts"] > 10) {
                await this.cb.call(this, "error", String(ex));
                return
            }
            await this.sleep(this["viewBlock-timeout"])
            this.viewBlockFromTx(txHash);
        }
    }

    // Get transaction for txExplorer
    async viewTransaction(txHash, changeView) {
        await this.cb.call(this, "wait", "Getting Transaction");
        try {
            this.transactionHash = txHash;
            if (txHash.indexOf('0x') >= 0) {
                txHash = txHash.slice(2);
            }
            let Tx = await this.wallet.Rpc.getMinedTransaction(txHash);
            this.transaction = Tx["Tx"];
            let txHeight = await this.wallet.Rpc.getTxBlockHeight(txHash);
            this.transactionHeight = txHeight;
            await this.backOffRetry("viewTx", true);
            if (changeView) {
                await this.cb.call(this, "view", "txExplorer");
            }
            else {
                await this.cb.call(this, "success");
            }
        }
        catch (ex) {
            console.log(ex)
            await this.backOffRetry("viewTx");
            if (this["viewTx-attempts"] > 10) {
                this.transactionHash = false;
                this.transactionHeight = false;
                this.transaction = false;
                await this.cb.call(this, "error", String(ex));
                return
            }
            await this.sleep(this["viewTx-timeout"])
            this.viewTransaction(txHash, changeView);
        }
    }

    async backOffRetry(fn, reset) {
        if (reset) {
            this[String(fn) + "-timeout"] = 1000;
            this[String(fn) + "-attempts"] = 1
            return
        }
        if (!this[String(fn) + "-timeout"]) {
            this[String(fn) + "-timeout"] = 1000;
        }
        else {
            this[String(fn) + "-timeout"] = Math.floor(this[String(fn) + "-timeout"] * 1.25);
        }
        if (!this[String(fn) + "-attempts"]) {
            this[String(fn) + "-attempts"] = 1
        }
        else {
            this[String(fn) + "-attempts"] += 1;;
        }
    }

    getDSExp(data, deposit, issuedAt) {
        try {
            let dataSize = Buffer.from(data, "hex").length;
            if (BigInt(dataSize) > BigInt(this.MaxDataStoreSize)) {
                throw "Data size is too large"
            }
            let epoch = BigInt("0x" + deposit) / BigInt((BigInt(dataSize) + BigInt(this.BaseDatasizeConst)))
            if (BigInt(epoch) < BigInt(2)) {
                throw "invalid dataSize and deposit causing integer overflow"
            }
            let numEpochs = BigInt(BigInt(epoch) - BigInt(2));
            let expEpoch = (BigInt(issuedAt) + BigInt(numEpochs));
            return expEpoch;
        }
        catch (ex) {
            return false;
        }
    }

    async addTxOut(txOut) {
        try {
            this.txOuts.push(txOut)
            await this.cb.call(this, "success");
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    async setTxOuts(txOuts) {
        try {
            this.txOuts = txOuts;
            await this.cb.call(this, "success");
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    async setChangeAddress(changeAddress) {
        try {
            this.changeAddress = changeAddress;
            await this.cb.call(this, "success");
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    async setDsSearchOpts(searchOpts) {
        try {
            this.dsSearchOpts = searchOpts;
            await this.cb.call(this, "success");
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    async setDsDataStores(DataStores) {
        try {
            this.dsDataStores = this.dsDataStores.concat(DataStores)
            await this.cb.call(this, "success");
        }
        catch (ex) {
            console.trace(ex)
            await this.cb.call(this, "error", String(ex));
        }
    }

    async setDsActivePage(activePage) {
        try {
            this.dsActivePage = activePage;
            await this.cb.call(this, "success");
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    async setDsView(dsView) {
        try {
            this.dsView = dsView;
            await this.cb.call(this, "success");
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

    // Hex to integer
    hexToInt(hex) {
        try {
            let bInt = BigInt(hex, 16);
            return bInt.toString();
        }
        catch (ex) {

        }
    }

    // Delay for the monitor
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
export default MadNetAdapter;