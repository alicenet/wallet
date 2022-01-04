import React from 'react';
import store from 'redux/store/store';
import BigInt from 'big-integer';
import { ADAPTER_ACTION_TYPES, TRANSACTION_ACTION_TYPES } from 'redux/constants/_constants';
import { ADAPTER_ACTIONS, TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import { getMadWalletInstance } from 'redux/middleware/WalletManagerMiddleware'
import { default_log as log } from 'log/logHelper'
import { SyncToastMessageSuccess, SyncToastMessageWarning } from 'components/customToasts/CustomToasts'
import { toast } from 'react-toastify';
import { curveTypes } from 'util/wallet';
import { history } from 'history/history';
import utils from 'util/_util';

class MadNetAdapter {

    constructor() {

        this.wallet = () => getMadWalletInstance(); // Get latest madWallet for any actions needing it.
        this.provider = () => (store.getState().config.mad_net_provider);
        this.chainID = () => (store.getState().config.mad_net_chainID);

        this.subscribed = false;
        this.isInitializing = false; // Is the instance currently initializing? -- Used to prevent repeat initializations

        this.lastNotedConfig = {
            mad_net_chainID: false,
            mad_net_provider: false,
        }

        // Error cache -- Cache first errors so that on retries the correct error is relayed to the user
        this.errors = {};

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
        // Set default searchOpts
        this.dsSearchOpts = this._handleReduxStateValue(["dataExplore", "searchOpts"]);
        this.dsSearchOpts.set({ "address": "", "offset": "", "bnCurve": false });
        // Set default dataStores
        this.dsDataStores = this._handleReduxStateValue(["dataExplore", "dataStores"]);
        this.dsDataStores.set([]);
        // Set default activePage
        this.dsActivePage = this._handleReduxStateValue(["dataExplore", "activePage"]);
        this.dsActivePage.set([]);
        // Set default dsView
        this.dsView = this._handleReduxStateValue(["dataExplore", "dsView"]);
        this.dsView.set([]);

        // Set fees 
        this.fees = this._handleReduxStateValue(["fees"]);
        this.fees.set({});

    }

    /**
     * Initiate the madNet Adapter and verify a connection is possible
     * @param {Object} config - Init Config
     * @property { Bool } config.preventToast - Should the success toast be prevented?
     * @property { Bool } config.reinit - Is this a reinit cycle?
     */
    async __init(config = {}) {
        console.log("MADCONFIG", config)
        store.dispatch(ADAPTER_ACTIONS.setMadNetBusy(true));
        // this._listenToStore(); // Don't listen -- Use manual update in adapter actions
        try {
            this._updateLastNotedConfig();
            await this.wallet().Rpc.setProvider(this.provider())
            this.connected.set(true);
            this.failed.set(false);
            if (!config.preventToast) {
                toast.success(<SyncToastMessageSuccess basic title="Success" message="MadNet Connected"/>, { className: "basic", "autoClose": 2400 })
            }
            store.dispatch(ADAPTER_ACTIONS.setMadNetBusy(false));
            // Attempt to get fees -- RPC will throw if unfetchable
            let fees = await this.wallet().Rpc.getFees();
            // Re-assign to internal camelCase keys
            this.fees.set({
                atomicSwapFee: fees.AtomicSwapFee,
                dataStoreFee: fees.DataStoreFee,
                minTxFee: fees.MinTxFee,
                valueStoreFee: fees.ValueStoreFee
            });
            store.dispatch(TRANSACTION_ACTIONS.parseAndUpdateFees({
                atomicSwapFee: fees.AtomicSwapFee,
                dataStoreFee: fees.DataStoreFee,
                minTxFee: fees.MinTxFee,
                valueStoreFee: fees.ValueStoreFee
            }));
            return { success: true }
        } catch (ex) {
            this.failed.set(ex.message);
            toast.error(<SyncToastMessageWarning title="Madnet Error!" message="Check network settings"/>,
                { className: "basic", "autoClose": 5000, "onClick": () => { history.push("/wallet/advancedSettings") } })
            store.dispatch(ADAPTER_ACTIONS.setMadNetBusy(false));
            store.dispatch(ADAPTER_ACTIONS.setMadNetConnected(false));
            return ({ error: ex })
        }
    }

    _updateLastNotedConfig(mad_net_chainID = this.chainID(), mad_net_provider = this.provider()) {
        this.lastNotedConfig = {
            mad_net_chainID: mad_net_chainID,
            mad_net_provider: mad_net_provider,
        }
    }

    /**
     * Setup listeners on the redux store for configuration changes -- This may not be needed at the moment
     */
    // -- Potentially to be deprecated -- Not used as of store listen update
    async _listenToStore() {
        // Always cancel previous subscription
        if (this.subscribed) {
            return; // Call the subscribed function to unsubscribe from the store if a previous subscription exists
        }
        // On any state updates if the last notable config state does not pass equality, force reinitialization of the adapter
        this.subscribed = store.subscribe(async () => {
            let state = store.getState();
            let latestConfig = state.config;
            let isLocked = state.vault.is_locked;
            // If at any point attempts are made when the vault is locked -- Ignore them
            if (isLocked) {
                log.debug("Skipping subscription checks on MadNet Adapter -- Account is locked")
                return
            }
            let newNotableState = {
                mad_net_chainID: latestConfig.mad_net_chainID,
                mad_net_provider: latestConfig.mad_net_provider,
            }
            let updateOccurance = await (() => {
                return new Promise(res => {
                    Object.keys(newNotableState).forEach(key => {
                        if (newNotableState[key] !== this.lastNotedConfig[key]) {
                            res(true);
                        }
                    })
                    res(false);
                })
            })()
            if (updateOccurance) {
                if (!this.isInitializing) { // Guard against re-entrances on initializing
                    log.debug("Configuration change for MadAdapter Adapter -- Reinitializing")
                    this.isInitializing = true;
                    await this.__init({ preventToast: true, reinit: true });
                    this.isInitializing = false;
                }
            }
        })
    }

    /** Fetch upto date balances for MadNetWallets
     * @returns { Object } -- Returns latest balances state
     */
    async getAllMadWalletBalancesWithUTXOs() {
        let madWallet = this.wallet();
        let balancesAndUtxos = {};
        for (let wallet of madWallet.Account.accounts) {
            let [balance, utxos] = await this._getMadNetWalletBalanceAndUTXOs(wallet.address, wallet.curve);
            if (balance.error) {
                return { error: balance.error }
            }
            balancesAndUtxos[wallet.address] = { balance: balance, utxos: utxos };
        }
        // Update the new balances to state
        let newBalances = { ...store.getState().vault.balances };

        // Check each address and update accordingly -- Make sure previous state from web3 updates is kept
        for (let address in balancesAndUtxos) {
            let addressBalancesAndUtxos = balancesAndUtxos[address];
            // Create the balance entry if it doesn't exist yet
            if (!newBalances[address]) {
                newBalances[address] = {};
            }
            // Update balances
            newBalances[address].madBytes = addressBalancesAndUtxos["balance"];
            newBalances[address].madUTXOs = addressBalancesAndUtxos["utxos"];
        }

        // Return newly updated balances and utxos
        return newBalances;
    }

    /**
     * Returns both the balance and utxos for a corresponding address
     * @param { String } address
     * @returns {Array} - [balance, utxos]
     */
    async getMadWalletBalanceWithUTXOsForAddress(address) {
        let madWallet = this.wallet();
        let madJSWallet;
        try {
            madJSWallet = madWallet.Account.accounts.filter(wallet => wallet.address === address)[0];
        } catch (ex) {
            return { error: "Unable to filter out address from current madJSWallet instance. State imbalance? See error: ", ex }
        }
        if (!madJSWallet) {
            return [{ error: "MadWalletJS wallet instance not found" }, null];
        }
        let [balance, utxos] = await this._getMadNetWalletBalanceAndUTXOs(madJSWallet.address, madJSWallet.curve);
        if (balance.error) {
            return { error: balance.error }
        }
        return [balance, utxos];
    }

    /**
     * Returns mad wallet balance and utxoids for respective address and curve
     * @param address - Wallet address to look up the balance for
     * @param curve - Address curve to use
     */
    async _getMadNetWalletBalanceAndUTXOs(address, curve) {
        let madWallet = this.wallet();
        try {
            let [utxoids, balance] = await madWallet.Rpc.getValueStoreUTXOIDs(address, curve)
            balance = madWallet.Validator.hexToInt(balance)
            return [balance, utxoids];
        } catch (ex) {
            return [{ error: ex }, null]
        }
    }

    getMadNetWalletInstance() {
        return this.wallet();
    }

    /**
     * Fetch previous transactions for a given account
     * @param { Array<String> } addresses - Array of addresses to get previous transactions for
     * @returns { Array[ [Array<Object>], currentBlock<Int> ] } - Array of previous transactions as well as the current block
     */
    async getPrevTransactions(addresses) {
        try {
            let madWallet = this.wallet();
            let blockRange = 256;
            let currentBlock = await madWallet.Rpc.getBlockNumber();
            let pTx = [];
            for (let i = currentBlock; i >= (currentBlock - blockRange); i--) {
                let block = await madWallet.Rpc.getBlockHeader(i);
                if (!block["TxHshLst"] || block["TxHshLst"].length <= 0) {
                    continue;
                }
                transactionLoop:
                    for (let l = 0; l < block["TxHshLst"].length; l++) {
                        let tx = await madWallet.Rpc.getMinedTransaction(block["TxHshLst"][l]);
                        for (let j = 0; j < tx["Tx"]["Vout"].length; j++) {
                            for (let k = 0; k < addresses.length; k++) {
                                let address = addresses[k]["address"].toLowerCase();
                                let curve = addresses[k]["curve"]
                                if (curve == 2) { // eslint-disable-line
                                    curve = "02"
                                }
                                else {
                                    curve = "01";
                                }
                                // TODO: REFACTOR: Abstract these checks to an internal function
                                if ((
                                        tx["Tx"]["Vout"][j]["AtomicSwap"] &&
                                        address == tx["Tx"]["Vout"][j]["AtomicSwap"]["ASPreImage"]["Owner"].slice(4) && // eslint-disable-line
                                        curve == tx["Tx"]["Vout"][j]["AtomicSwap"]["ASPreImage"]["Owner"].slice(2, 4) // eslint-disable-line
                                    ) ||
                                    (
                                        tx["Tx"]["Vout"][j]["ValueStore"] &&
                                        address == tx["Tx"]["Vout"][j]["ValueStore"]["VSPreImage"]["Owner"].slice(4) && // eslint-disable-line
                                        curve == tx["Tx"]["Vout"][j]["ValueStore"]["VSPreImage"]["Owner"].slice(2, 4) // eslint-disable-line
                                    ) ||
                                    (
                                        tx["Tx"]["Vout"][j]["DataStore"] &&
                                        address == tx["Tx"]["Vout"][j]["DataStore"]["DSLinker"]["DSPreImage"]["Owner"].slice(4) && // eslint-disable-line
                                        curve == tx["Tx"]["Vout"][j]["DataStore"]["DSLinker"]["DSPreImage"]["Owner"].slice(2, 4) // eslint-disable-line
                                    )
                                ) {
                                    pTx = pTx.concat(tx)
                                    continue transactionLoop;
                                }
                            }
                        }
                    }
            }
            return [pTx, currentBlock];
        } catch (ex) {
            return ([{ error: ex }])
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
            }
            else if (depth === 2) {
                return state[keyChain[0]][keyChain[1]]
            }
            else if (depth === 3) {
                return state[keyChain[0]][keyChain[1]][keyChain[2]]
            }
        };
        let setter = (value) => {
            store.dispatch({
                type: ADAPTER_ACTION_TYPES.SET_MADNET_KEYCHAIN_VALUE, payload: {
                    keyChain: keyChain, value: value
                }
            })
        };
        return { get: getter, set: setter };
    }

    /**
     * After createTx has been called, get estimated fees for the Tx
     * @returns { Object } - Estimated Fees object
     */
    async getEstimatedFees() {
        return await this.wallet().Transaction.getTxFeeEstimates(this.changeAddress.get()["address"], this.changeAddress.get()["bnCurve"], [], true);
    }

    /**
     * Create Tx from sent txOuts
     * @param { Boolean } send - Should the tx also be sent?
     * @returns
     */
    async createTx() {
        if (this.pendingTx.get()) {
            return ({ error: "Waiting for pending transaction to be mined" });
        }
        this.pendingTxStatus.set("Sending transaction");
        for await (const txOut of this.txOuts.get()) {
            try {
                switch (txOut.type) {
                    case "VS":
                        log.debug("TxOut created as ValueStore: ", txOut);
                        await this.wallet().Transaction.createValueStore(txOut.fromAddress, txOut.value, txOut.toAddress, txOut.bnCurve ? curveTypes.BARRETO_NAEHRIG : curveTypes.SECP256K1)
                        break;
                    case "DS":
                        log.debug("TxOut created as DataStore: ", txOut);
                        await this.wallet().Transaction.createDataStore(txOut.fromAddress, txOut.index, txOut.duration, txOut.rawData)
                        break;
                    default:
                        throw new Error("Invalid TxOut type");
                }
            } catch (ex) {
                this.clearTXouts();
                this.changeAddress.set({});
                await this.wallet().Transaction._reset();
                return ({ error: ex.message });
            }
        }
        return true; // Just return true if no failure
    }

    async sendTx() {
        try {
            let tx = await this.wallet().Transaction.sendTx(this.changeAddress.get()["address"], this.changeAddress.get()["bnCurve"]);
            await this.backOffRetry('sendTx', true);
            this.pendingTx.set(tx);
            store.dispatch({ type: TRANSACTION_ACTION_TYPES.SET_LAST_SENT_TX_HASH, payload: tx });
            await this.pendingTxStatus.set("Pending TxHash: " + this.trimTxHash(tx));
            await this.wallet().Transaction._reset();
            toast.success(<SyncToastMessageWarning basic title="TX Pending" message={utils.string.splitStringWithEllipsis(tx, 6)} hideIcon/>)
            // Clear any TXOuts on a successful mine
            this.txOuts.set([]);
            return await this.monitorPending();
        } catch (ex) {
            if (!this['sendTx-attempts']) {
                // Only overwrite error on first attempt
                this.errors['sendTx'] = ex;
            }
            await this.backOffRetry('sendTx');
            if (this['sendTx-attempts'] > 2) {
                // Clear txOuts on a final fail
                this.txOuts.set([]);
                this.changeAddress.set({});
                await this.wallet().Transaction._reset();
                await this.backOffRetry('sendTx', true);
                return { error: this.errors['sendTx'].message };
            }
            await this.sleep(this['sendTx-timeout']);
            return await this.sendTx();
        }
    }

    // Monitor the pending transaction the was sent
    async monitorPending() {
        let tx = this.pendingTx.get();
        try {
            let txDetails = await this.wallet().Rpc.getMinedTransaction(tx);
            await this.backOffRetry('pending-' + JSON.stringify(tx), true);
            this.pendingTx.set(false);
            // Success TX Mine
            toast.success(<SyncToastMessageSuccess title="TX Mined" message={utils.string.splitStringWithEllipsis(tx, 6)} hideIcon basic/>)
            return { "txDetails": txDetails.Tx, "txHash": tx, "msg": "Mined: " + this.trimTxHash(tx) };
        } catch (ex) {
            await this.backOffRetry('pending-' + JSON.stringify(tx));
            if (this['pending-' + JSON.stringify(tx) + "-attempts"] > 30) {
                this.pendingTx.set(false);
                await this.backOffRetry('pending-' + JSON.stringify(tx), true);
                return { error: ex.message, "txDetails": false, "txHash": tx.error ? false : tx };
            }
            await this.sleep(this["pending-" + JSON.stringify(tx) + "-timeout"]);
            return await this.monitorPending();
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
                let tmpBlocks = this.blocks.get() ? this.blocks.get().slice(0) : [];
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
                await this.backOffRetry("monitorBlocks", true);
            } catch (ex) {
                await this.backOffRetry("monitorBlocks");
                if (this["monitorBlocks-attempts"] > 10) {
                    this.blockStatus.set("Could not update latest block.");
                    return;
                }
            }
            this.blockStatus.set("Currently Monitoring Blocks");
            this.blocksLocked.set(false);
            this.blocksIdTimeout = setTimeout(() => { try { this.monitorBlocks() } catch (ex) { console.log(ex) } }, this["monitorBlocks-attempts"] == 1 ? 5000 : this["monitorBlocks-timeout"]);
        } catch (ex) {
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

    // Get block for modal
    async viewBlock(height) {
        try {
            let blockHeader = await this.wallet().Rpc.getBlockHeader(height);
            await this.cb.call(this, "notify", blockHeader);
            await this.backOffRetry("vB", true);
            return blockHeader
        } catch (ex) {
            await this.backOffRetry("vB");
            if (this['vB-attempts'] > 10) {
                return { error: ex };
            }
            await this.sleep(this["vB-timeout"]);
            this.viewBlock(height);
        }
    }

    // Get block for modal
    async viewBlockFromTx(txHash) {
        try {
            let txHeight = await this.wallet().Rpc.getTxBlockHeight(txHash);
            this.transactionHeight.set(txHeight);
            let blockHeader = await this.wallet().Rpc.getBlockHeader(txHeight);
            await this.backOffRetry("viewBlock", true);
            return blockHeader;
        } catch (ex) {
            await this.backOffRetry("viewBlock");
            if (this["viewBlock-attempts"] > 10) {
                return { error: ex };
            }
            await this.sleep(this["viewBlock-timeout"]);
            this.viewBlockFromTx(txHash);
        }
    }

    // Get transaction for txExplorer
    async viewTransaction(txHash) {
        try {
            this.transactionHash.set(txHash);
            txHash = utils.string.removeHexPrefix(txHash);
            let Tx = await this.wallet().Rpc.getMinedTransaction(txHash);
            this.transaction.set(Tx["Tx"]);
            let txHeight = await this.wallet().Rpc.getTxBlockHeight(txHash);
            this.transactionHeight.set(txHeight);
            await this.backOffRetry("viewTx", true);
            return { tx: Tx, txHeight: txHeight };
        } catch (ex) {
            await this.backOffRetry("viewTx");
            // Reducing to 1, as the internal library has a retry of ~5 RPC requests -- Just fail if that doesn't work.
            if (this["viewTx-attempts"] >= 1) {
                this.transactionHash.set(false);
                this.transactionHeight.set(false);
                this.transaction.set(false);
                return { error: ex };
            }
            await this.sleep(this["viewTx-timeout"]);
            this.viewTransaction(txHash);
        }
    }

    // TODO: REFACTOR: Move string types to constant configuration file, eg fn names to remove chance of mistypes
    backOffRetry(fn, reset) {
        if (reset) {
            this[String(fn) + "-timeout"] = 1000;
            this[String(fn) + "-attempts"] = 1;
            return;
        }
        if (!this[String(fn) + "-timeout"]) {
            this[String(fn) + "-timeout"] = 1000;
        }
        else {
            this[String(fn) + "-timeout"] = Math.floor(this[String(fn) + "-timeout"] * 1.25);
        }
        if (!this[String(fn) + "-attempts"]) {
            this[String(fn) + "-attempts"] = 1;
        }
        else {
            this[String(fn) + "-attempts"] += 1;
        }
    }

    getDSExp(data, deposit, issuedAt) {
        try {
            let dataSize = Buffer.from(data, "hex").length;
            if (BigInt(dataSize) > BigInt(this.MaxDataStoreSize)) {
                throw Error("Data size is too large");
            }
            let epoch = BigInt("0x" + deposit) / BigInt((BigInt(dataSize) + BigInt(this.BaseDatasizeConst)));
            if (BigInt(epoch) < BigInt(2)) {
                throw Error("invalid dataSize and deposit causing integer overflow");
            }
            let numEpochs = BigInt(BigInt(epoch) - BigInt(2));
            let expEpoch = (BigInt(issuedAt) + BigInt(numEpochs));
            return expEpoch;
        } catch (ex) {
            return { error: ex };
        }
    }

    addTxOut(txOut) {
        try {
            let newTxOuts = [...this.txOuts.get()];
            newTxOuts.push(txOut);
            this.txOuts.set(newTxOuts);
            log.debug("Mad Net Adapter: Added new TXOut: ", txOut);
            return newTxOuts;
        } catch (ex) {
            return { error: ex };
        }
    }

    clearTXouts() {
        try {
            let newTxOuts = [];
            this.txOuts.set(newTxOuts);
            log.debug("Mad Net Adapter: Cleared TXOuts :", this.txOuts.get());
            return newTxOuts;
        } catch (ex) {
            return { error: ex };
        }
    }

    setTxOuts(txOuts) {
        try {
            this.txOuts.set(txOuts);
            return txOuts;
        } catch (ex) {
            return { error: ex };
        }
    }

    setChangeAddress(changeAddress) {
        try {
            this.changeAddress.set(changeAddress);
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }

    setDsSearchOpts(searchOpts) {
        try {
            this.dsSearchOpts.set(searchOpts);
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }

    setDsSearchAddress(address) {
        try {
            let newOpts = { ...this.dsSearchOpts.get() };
            newOpts.address = address;
            this.dsSearchOpts.set(newOpts);
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }

    setDsDataStores(DataStores) {
        try {
            this.dsDataStores.set(this.dsDataStores.get().concat(DataStores));
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }

    setDsActivePage(activePage) {
        try {
            this.dsActivePage.set(activePage);
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }

    setDsView(dsView) {
        try {
            this.dsView.set(dsView);
            return true;
        } catch (ex) {
            return { error: ex };
        }
    }

    // Trim txHash for readability
    trimTxHash(txHash) {
        try {
            let trimmed = "0x" + txHash.substring(0, 6) + "..." + txHash.substring(txHash.length - 6);
            return trimmed;
        } catch (ex) {
            throw new Error(ex)
        }
    }

    // Hex to integer
    hexToInt(hex) {
        try {
            let bInt = BigInt(hex, 16);
            return bInt.toString();
        } catch (ex) {
            throw new Error(ex);
        }
    }

    // Delay for the monitor
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const madNetAdapter = new MadNetAdapter();

export default madNetAdapter;