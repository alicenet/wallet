import store from '../redux/store/store';
import { ADAPTER_ACTIONS } from 'redux/actions/_actions';
import BigInt from "big-integer";
import { ADAPTER_ACTION_TYPES } from 'redux/constants/_constants';
import { getMadWalletInstance } from 'redux/middleware/WalletManagerMiddleware'

class MadNetAdapter {

    constructor() {

        this.wallet = () => getMadWalletInstance(); // Get latest madWallet for any actions needing it.
        this.provider = store.getState().config.mad_net_provider;

        this.connected = this._handleReduxStateValue(["connected"]);
        this.failed = this._handleReduxStateValue(["error"]);
        this.MaxDataStoreSize = 2097152;
        this.BaseDatasizeConst = 376;

        // Transaction panel
        this.txOuts = this._handleReduxStateValue(["transactions", "txOuts"]);
        this.changeAddress = this._handleReduxStateValue(["transactions", "changeAddress"]);
        this.pendingTx = this._handleReduxStateValue(["transactions", "pendingTx"]);
        this.pendingTxStatus = this._handleReduxStateValue(["transactions", "pendingTxStatus"]);
        this.pendingLocked = this._handleReduxStateValue(["transactions", "pendingLocked"]);

        // Block explorer panel
        this.blocks = this._handleReduxStateValue(["blocks", "list"]);
        this.blockStatus = this._handleReduxStateValue(["blocks", "status"]);
        this.blocksMaxLen = 10
        this.blocksStarted = this._handleReduxStateValue(["blocks", "started"]);
        this.currentBlock = this._handleReduxStateValue(["blocks", "current"]);
        this.blocksLocked = this._handleReduxStateValue(["blocks", "locked"]);
        this.blocksIdTimeout = false;
        this.mbAttempts = 0;

        // Tx explorer panel
        this.transactionHash = this._handleReduxStateValue(["txExplore", "txHash"]);
        this.transaction = this._handleReduxStateValue(["txExplore", "tx"]);
        this.transactionHeight = this._handleReduxStateValue(["txExplore", "txHeight"]);

        // DataStore explorer panel
        this.dsRedirected = this._handleReduxStateValue(["dataExplore", "redirected"]);
        this.dsSearchOpts = this._handleReduxStateValue(["dataExplore", "searchOpts"]);
        this.dsDataStores = this._handleReduxStateValue(["dataExplore", "dataStores"]);
        this.dsActivePage = this._handleReduxStateValue(["dataExplore", "activePage"]);
        this.dsView = this._handleReduxStateValue(["dataExplore", "dsView"]);

    }

    async __init() {
        try {
            await this.wallet().Rpc.setProvider(this.provider)
            this.connected.set(true);
            this.failed.set(false);
            return true;
        }
        catch (ex) {
            this.failed.set(ex.message);
            return ({ error: ex })
        }
    }

    /** 
     * Return a getter/setter for a specific redux state value keyChain -- Object depth of max 3 supported
     * @prop {Array} keyChain - An array of nested keys to access the desired value
     * */
    _handleReduxStateValue(keyChain) {
        let depth = keyChain.length;
        let getter = () => {
            let state = store.getState().adapter.madNetAdapter;
            if (depth === 1) {
                return state[keyChain[0]]
            } else if (depth === 2) {
                return state[keyChain[0]][keyChain[1]]
            } else if (depth === 3) {
                return state[keyChain[0]][keyChain[1]][keyChain[2]]
            }
        }
        let setter = (value) => {
            store.dispatch({
                type: ADAPTER_ACTION_TYPES.SET_MADNET_KEYCHAIN_VALUE, payload: {
                    keyChain: keyChain, value: value
                }
            })
        }
        return { get: getter, set: setter };
    }

    // Create the transaction from user inputed TxOuts
    async createTx() {
        if (this.pendingTx.get()) {
            return ({ error: "Waiting for pending transaction to be mined" });
        }
        this.pendingTxStatus.set("Sending transaction")
        for await (let txOut of this.txOuts.get()) {
            try {
                switch (txOut.type) {
                    case "VS":
                        await this.wallet().Transaction.createValueStore(txOut.fromAddress, txOut.value, txOut.toAddress, txOut.bnCurve ? 2 : 1)
                        break;;
                    case "DS":
                        await this.wallet().Transaction.createDataStore(txOut.fromAddress, txOut.index, txOut.duration, txOut.rawData)
                        break;;
                    default:
                        throw new Error("Invalid TxOut type");
                }
            }
            catch (ex) {
                this.txOuts.set([]);
                this.changeAddress.set({});
                await this.wallet().Transaction._reset();
                return ({ error: ex.message })
            }
        }
        return await this.sendTx();
    }

    async sendTx() {
        try {
            await this.wallet().Transaction._createTxIns(this.changeAddress.get()["address"], this.changeAddress.get()["bnCurve"])
            await this.wallet().Transaction.Tx._createTx();
            let tx = await this.wallet().Rpc.sendTransaction(this.wallet().Transaction.Tx.getTx())
            await this.backOffRetry('sendTx', true)
            this.pendingTx.set(tx);
            await this.pendingTxStatus.set("Pending TxHash: " + this.trimTxHash(tx));
            await this.wallet().Transaction._reset();
            return await this.monitorPending();
        }
        catch (ex) {
            await this.backOffRetry('sendTx')
            if (this['sendTx-attempts'] > 5) {
                this.txOuts.set([]);
                this.changeAddress.set({});
                await this.wallet().Transaction._reset();
                await this.backOffRetry('sendTx', true)
                return { error: ex.message }
            }
            await this.sleep(this['sendTx-timeout']);
            return await this.sendTx();
        }
    }

    // Monitor the pending transaction the was sent
    async monitorPending() {
        let tx = this.pendingTx.get();
        try {
            await this.wallet().Rpc.getMinedTransaction(tx);
            await this.backOffRetry('pending-' + JSON.stringify(tx), true)
            this.pendingTx.set(false);
            return { "txHash": tx, "msg": "Mined: " + this.trimTxHash(tx) };
        }
        catch (ex) {
            await this.backOffRetry('pending-' + JSON.stringify(tx))
            if (this['pending-' + JSON.stringify(tx) + "-attempts"] > 30) {
                this.pendingTx.set(false);
                await this.backOffRetry('pending-' + JSON.stringify(tx), true)
                return { error: ex.message }
            }
            await this.sleep(this["pending-" + JSON.stringify(tx) + "-timeout"])
            return await this.monitorPending(tx)
        }
    }

    // Monitor new blocks, lazy loading
    async monitorBlocks() {
        if (!this.blocksStarted) {
            this.blocksStarted.set(true);
        }
        try {
            if (this.blocksLocked.get()) {
                return;
            }
            this.blocksLocked.set(true);
            try {
                let tmpBlocks = this.blocks.get() ? this.blocks.get().slice(0) : []
                let currentBlock = await this.wallet().Rpc.getBlockNumber();
                if (this.currentBlock.get() !== currentBlock) {
                    let blockDiff = (currentBlock - this.currentBlock.get());
                    if (blockDiff > this.blocksMaxLen) {
                        blockDiff = this.blocksMaxLen;
                    }
                    for (let i = 0; i < blockDiff; i++) {
                        let blockHeader = await this.wallet().Rpc.getBlockHeader(currentBlock - ((blockDiff - i) - 1));
                        tmpBlocks.unshift(blockHeader);
                    }
                    this.currentBlock.set(currentBlock);
                    this.blocks.set(tmpBlocks);
                }
                tmpBlocks = tmpBlocks.slice(0, this.blocksMaxLen);
                this.blocks.set(tmpBlocks);
                await this.backOffRetry("monitorBlocks", true)
            }
            catch (ex) {
                await this.backOffRetry("monitorBlocks")
                if (this["monitorBlocks-attempts"] > 10) {
                    this.blockStatus.set("Could not update latest block.")
                    return
                }
            }
            this.blockStatus.set("Currently Monitoring Blocks")
            this.blocksLocked.set(false);
            //eslint-disable-next-line
            this.blocksIdTimeout = setTimeout(() => { try { this.monitorBlocks() } catch (ex) { console.log(ex) } }, this["monitorBlocks-attempts"] == 1 ? 5000 : this["monitorBlocks-timeout"]);
        }
        catch (ex) {
            console.log(ex)
            await this.cb.call(this, "error", String(ex));
        }
    }

    // Reset block monitor
    async blocksReset() {
        clearTimeout(this.blocksIdTimeout);
        this.blocks.set([]);
        this.blocksStarted.set(false);
        this.currentBlock.set(0);
        this.blocksLocked.set(false);
    }

    // TODO: Cat Continue Porting here after testing above functionality . . . //

    // Get block for modal
    async viewBlock(height) {
        await this.cb.call(this, "wait", "Getting Block");
        try {
            let blockHeader = await this.wallet().Rpc.getBlockHeader(height);
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
            let txHeight = await this.wallet().Rpc.getTxBlockHeight(txHash);
            this.transactionHeight.set(txHeight);
            let blockHeader = await this.wallet().Rpc.getBlockHeader(txHeight);
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
            this.transactionHash.set(txHash);
            if (txHash.indexOf('0x') >= 0) {
                txHash = txHash.slice(2);
            }
            let Tx = await this.wallet().Rpc.getMinedTransaction(txHash);
            this.transaction.set(Tx["Tx"]);
            let txHeight = await this.wallet().Rpc.getTxBlockHeight(txHash);
            this.transactionHeight.set(txHeight);
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
                this.transactionHash.set(false);
                this.transactionHeight.set(false);
                this.transaction.set(false);
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
                throw Error("Data size is too large")
            }
            let epoch = BigInt("0x" + deposit) / BigInt((BigInt(dataSize) + BigInt(this.BaseDatasizeConst)))
            if (BigInt(epoch) < BigInt(2)) {
                throw Error("invalid dataSize and deposit causing integer overflow")
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
            let newTxOuts = [...this.txOuts.get()];
            newTxOuts.push(txOut)
            this.txOuts.set(newTxOuts);
            await this.cb.call(this, "success");
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    async setTxOuts(txOuts) {
        try {
            this.txOuts.set(txOuts);
            await this.cb.call(this, "success");
        }
        catch (ex) {
            await this.cb.call(this, "error", String(ex));
        }
    }

    async setChangeAddress(changeAddress) {
        try {
            this.changeAddress.set(changeAddress);
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

const madNetAdapter = new MadNetAdapter();

export default madNetAdapter;