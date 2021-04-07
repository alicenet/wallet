const BigInt = require("big-integer");

class MadNetAdapter {
    constructor(cb, wallet, provider) {
        this.cb = cb;
        this.wallet = wallet;
        this.provider = provider;
        this.connected = false;
        this.MaxDataStoreSize = 2097152;
        this.BaseDatasizeConst = 376;

        // Transaction panel
        this.txOuts = [];
        this.changeAddress = { "address": "", "bnCurve": false };
        this.pending = [];
        this.pendingLocked = false;

        // Block explorer panel
        this.blocks = [];
        this.blocksStarted = false;
        this.currentBlock = 0;
        this.blocksLocked = false;
        this.blocksId = false;

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
            await this.cb.call(this, "success")
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }



    // Create the transaction from user inputed TxOuts
    async createTx() {
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
        try {
            let tx = await this.wallet.Transaction.sendTx(this.changeAddress["address"], this.changeAddress["bnCurve"]);
            await this.cb.call(this, "success", { "type": "warning", "msg": "Pending: " + this.trimTxHash(tx) });
            this.pending.push(tx)
            this.monitorPending();
        }
        catch (ex) {
            this.txOuts = [];
            this.changeAddress = {};
            await this.wallet.Transaction._reset();
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
                if (this.currentBlock !== currentBlock) {
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

    // Get block for modal
    async viewBlock(height) {
        await this.cb.call(this, "wait", "Getting Block");
        try {
            let blockHeader = await this.wallet.Rpc.getBlockHeader(height);
            await this.cb.call(this, "notify", blockHeader);
            return blockHeader
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
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
            return blockHeader
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
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
            if (changeView) {
                await this.cb.call(this, "view", "txExplorer");
            }
            else {
                await this.cb.call(this, "success");
            }
        }
        catch (ex) {
            this.transactionHash = false;
            this.transactionHeight = false;
            this.transaction = false;
            await this.cb.call(this, "error", String(ex));
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
        catch(ex) {
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
        catch(ex) {

        }
    }

    // Delay for the monitor
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
export default MadNetAdapter;