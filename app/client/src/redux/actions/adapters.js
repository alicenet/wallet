import { ADAPTER_ACTION_TYPES, TRANSACTION_ACTION_TYPES, VAULT_ACTION_TYPES } from '../constants/_constants';
import web3Adapter from 'adapters/web3Adapter';
import { default_log as log } from 'log/logHelper';
import aliceNetAdapter from 'adapters/alicenetAdapter';
import { transactionTypes } from 'util/transaction';
import utils, { genericUtils, transactionUtils } from 'util/_util';
import { TRANSACTION_ACTIONS, VAULT_ACTIONS } from './_actions';
import { getAliceNetWalletInstance } from 'redux/middleware/WalletManagerMiddleware';

export const setWeb3Connected = (isConnected) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_CONNECTED, payload: isConnected })
    }
};

export const setWeb3Error = (error) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_ERROR, payload: error });
    };
};

export const setWeb3Info = (epoch, validators, max_validators) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_INFO, payload: { epoch: epoch, validators: validators, max_validators: max_validators } });
    };
};

export const setWeb3Epoch = epoch => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_EPOCH, payload: epoch });
    };
};

export const setWeb3Busy = busyState => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_WEB3_BUSY, payload: busyState });
    };
};

export const setAliceNetBusy = busyState => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_ALICENET_BUSY, payload: busyState });
    };
};

/**
 * If web3Adapter is not in a connected state attempt to connect
 * @param { Object } initConfig - Init config pass through for the web3Adapter __init function
 * @returns { Any } - DOC TODO:  NEEDS DOCUMENTED -- Placed to fix JS doc building
 */export const initWeb3 = (initConfig) => {
    return async (dispatch, getState) => {
        let connected = await web3Adapter.__init(initConfig);
        if (connected.error) {
            return { error: connected.error };
        }
        return true;
    };
};

export const setAliceNetConnected = (isConnected) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_ALICENET_CONNECTED, payload: isConnected });
    };
};

export const setAliceNetError = (error) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_ALICENET_ERROR, payload: error });
    };
};

export const setAliceNetKeyChainValue = (keyChain, value) => {
    return dispatch => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_ALICENET_KEYCHAIN_VALUE, payload: { keyChain: keyChain, value: value } });
    };
};

/**
 * If aliceNetAdapter is not in a connected state attempt to connect
 * @param { Object } initConfig - Init config passthrough for the aliceNetAdapter __init function
 * @returns { Any } - DOC TODO: NEEDS DOCUMENTED -- Placed to fix JS doc building
 */
export const initAliceNet = (initConfig) => {
    return async (dispatch, getState) => {
        let connected = await aliceNetAdapter.__init(initConfig);
        if (connected.error) {
            return { error: connected.error };
        }
        return true;
    };
};

// Single dispatch to call for initiating both Web3 and AliceNet adapters after vault unlocking / wallet loads
export const initAdapters = () => {
    return async (dispatch, getState) => {

        let web3Connected = await dispatch(initWeb3({ preventToast: true })); // Attempt to init web3Adapter -- Adapter will handle error toasts
        let aliceNetConnected = await dispatch(initAliceNet({ preventToast: true })); // Attempt to init aliceNetAdapter -- Adapter will handle error toasts

        if (web3Connected.error && aliceNetConnected) {
            return { success: true } // This is a partial success but the above adapter will issue the error
        }
        else if (aliceNetConnected.error && web3Connected) {
            return { success: true } // This is a partial success but the above adapter will issue the error       
        }
        else if (web3Connected && aliceNetConnected) {
            // Refetch balance for primary wallet if it exists on success
            let wallets = [...getState().vault.wallets.internal, ...getState().vault.wallets.external];
            if (wallets.length === 0) {
                return { success: true }
            }
            dispatch(getAndStoreLatestBalancesForAddress(wallets[0]?.address));
            return { success: true };
        }
        else {
            return {
                error: "Unable to initiate both adapters -- Verify network configuration, and check property errors for error collection if needed on subsequent runs.", errors: {
                    web3: web3Connected.error,
                    aliceNet: aliceNetConnected.error,
                }
            };
        }
    };
};

// Mark adapters as disconnected
export const disconnectAdapters = () => {
    return async (dispatch) => {
        dispatch({ type: ADAPTER_ACTION_TYPES.SET_DISCONNECTED });
    };
};

/**
 * Get and store the latest balances for a given address to redux state
 * @param { String } address
 * @returns { Array } [latestAddressBalances, allBalances]
 */
export const getAndStoreLatestBalancesForAddress = (address) => {
    return async (dispatch, getState) => {
        // Anytime balances are being loaded, set the loader to true
        dispatch(VAULT_ACTIONS.setBalancesLoading(true));

        let state = getState();
        let wallets = [...state.vault.wallets.internal, ...state.vault.wallets.external];
        let web3Connected = state.adapter.web3Adapter.connected;
        let aliceNetConnected = state.adapter.aliceNetAdapter.connected;
        let balanceState = { ...state.vault.balances }; // Get current balances for state object update

        // Set default balance object for this address
        let addressBalances = {
            eth: "Not Available",
            stake: "Not Available",
            stakeAllowance: "Not Available",
            util: "Not Available",
            utilAllowance: "Not Available",
            aliceNetBytes: "Not Available",
            aliceNetUTXOs: [],
        };

        let balancePromises = []; // [eth, [stake,stakeAllow,util,utilAllow], [aliceNetBytes, UTXOs]]

        // First get eth/staking/util balances -- Only if web3 connected
        if (web3Connected) {
            // Get the account privK based on the address from state to add to web3 to fetch balance information
            let wallet;
            try {
                wallet = wallets.filter(wal => wal.address === address)[0];
                balancePromises.push(web3Adapter.useAccount(wallet.privK));
            } catch (ex) {
                log.warn("Unable to parse wallet data for web3 balances of address: " + address, ". Is there a state imbalance? Error: ", ex);
            }
        }
        // Push an IIFE for a false resolving promise to position 0, to maintain array positions for the Promise.all resolve
        else {
            balancePromises.push((() => (new Promise(res => (res(false)))))());
            log.debug("Skipping eth/staking/util balance fetch for address: " + address + " :: Web3 not connected.");
        }
        // Second get aliceNetBytes balance/utxos -- Only if aliceNet connected
        if (aliceNetConnected) {
            balancePromises.push(aliceNetAdapter.getAliceNetWalletBalanceWithUTXOsForAddress(address));
        }
        else {
            addressBalances.aliceNetBytes = "Not Connected"
            log.debug("Skipping aliceNetBytes/UTXO balance fetch for address: " + address + " :: AliceNet not connected.");
        }

        // If neither alice net nor web3 is connected, don't bother to try and pull balances
        if (!aliceNetConnected && !web3Connected) {
            dispatch(VAULT_ACTIONS.setBalancesLoading(false));
            return false;
        }

        let foundBalances = await Promise.all(balancePromises);

        log.debug("FOUND", foundBalances);

        // Inject eth -- We expect false if these don't exist see ~L158 -- Self resolving IIFE for non-connects,
        // Additionally if an error exists on the balance resolve, don't attempt to parse them
        if (typeof foundBalances[0] !== 'undefined' && foundBalances[0] !== false && !foundBalances[0].error) {
            addressBalances.eth = foundBalances[0].balances.eth;
            addressBalances.stake = foundBalances[0].balances.stakingToken.balance;
            addressBalances.stakeAllowance = foundBalances[0].balances.stakingToken.allowance;
            addressBalances.util = foundBalances[0].balances.utilityToken.balance;
            addressBalances.utilAllowance = foundBalances[0].balances.utilityToken.allowance;
        }
        // AliceNet Bytes/UTXOs
        if (typeof foundBalances[1] !== 'undefined' && !foundBalances[1].error) {
            let [aliceNetBytes, aliceNetUTXOs] = foundBalances[1];
            addressBalances.aliceNetBytes = aliceNetBytes;
            addressBalances.aliceNetUTXOs = aliceNetUTXOs;
        }

        // Condense to updated state
        let updatedBalanceState = {
            ...balanceState,
            [address]: addressBalances
        };

        // Set new balance to state
        dispatch({ type: VAULT_ACTION_TYPES.SET_BALANCES_STATE, payload: updatedBalanceState });

        // Return latest found balances and the complete updated balance state
        dispatch(VAULT_ACTIONS.setBalancesLoading(false));
        return [addressBalances, updatedBalanceState];
    };
};

/**
 * Get and store recent TXs for a specific address into vault.recentTxs
 * @param { String } address - Address to fetch TXs for
 * @param { Integer } curve - Curve to use
 */
export const getAndStoreRecentTXsForAddress = (address, curve) => {
    return async (dispatch) => {
        log.debug("Fetching recent TXs for addresses: ", address);
        let [txs, currentBlock] = await aliceNetAdapter.getPrevTransactions([{ //eslint-disable-line
            address: address,
            curve: curve,
        }]);
        // Mark index 0 as false to signify that a check has happened
        if (txs.length === 0) {
            txs = [false];
        }
        dispatch({
            type: VAULT_ACTION_TYPES.UPDATE_RECENT_TXS_BY_ADDRESS, payload: {
                address: address,
                txs: txs,
            }
        });
        log.debug("Recent TXs fetched and updated to state for address: ", address);
        return true;
    };
};

/**
 * Prep TX Objects into AliceNetAdapter state -- Requires a forwarded dispatch state
 * @param { Object } state - Forwarded dispatch -- getState() state
 */
const _prepTxObjectsToAliceNetAdapter = async (state) => {

    let txReducerTxs = state.transaction.list;
    let preppedTxObjs = []; // Convert to proper tx format for aliceNetAdapter

    txReducerTxs.forEach((tx) => {
        if (tx.type === transactionTypes.DATA_STORE) {
            preppedTxObjs.push(
                transactionUtils.createDataStoreObject(tx.from, tx.key, tx.value, tx.duration)
            );
        }
        else if (tx.type === transactionTypes.VALUE_STORE) {
            preppedTxObjs.push(
                transactionUtils.createValueStoreObject(tx.from, tx.to, tx.value, tx.bnCurve)
            );
        }
        else {
            throw new Error("sendTransactionReducerTXs received incorrect txType of type: ", tx.type);
        }
    });

    // Add each tx to the txOutList of the aliceNetAdapter
    preppedTxObjs.forEach(tx => {
        aliceNetAdapter.addTxOut(tx);
    });

    log.debug("Prepped TX Objects To AliceNetAdapter (Not in AliceNetJS Instance yet) => ", {
        txReducerTxs: txReducerTxs,
        preppedTxObjs: preppedTxObjs,
    });

    return true;
};

/**
 * Creates a fake TX using aliceNetWallet instance, estimates fees, and immediately clears it for the next estimate or real transaction
 * @returns { Object | Boolean } - Successful fee estimate will return an object with fees or false for any failure in estimation
 */
export const createAndClearFakeTxForFeeEstimates = () => {
    return async (dispatch, getState) => {

        const state = getState();

        // If feePayer doesn't exist or no TXs, we are not in a state to estimate fees yet
        if (!state.transaction.feePayer.wallet || state.transaction.list.length === 0) {
            return false;
        }

        await _prepTxObjectsToAliceNetAdapter(state);

        log.debug("AliceNetAdapter FAKE_TxOuts(ForFeeEstimates) pending: ", aliceNetAdapter.txOuts.get());

        // Create the fee input
        let feePayerWallet = state.transaction.feePayer.wallet;
        let txFee = state.transaction.fees.txFee;

        log.debug("Fee Payer Wallet && txFee for fakeEstimateTx:", {
            feePayerWallet: feePayerWallet,
            txFee: txFee,
        });

        await aliceNetAdapter.wallet().Transaction.createTxFee(feePayerWallet.address, feePayerWallet.curve, txFee);
        await aliceNetAdapter.createTx();
        let estimateFees = await aliceNetAdapter.getEstimatedFees();

        // After fees have been estimated clear the tx state from the adapter and the wallet
        await aliceNetAdapter.wallet().Transaction._reset();
        aliceNetAdapter.clearTXouts();

        return estimateFees;
    };
};

/**
 * Aggregate the TXs from the transaction reduce into the aliceNetAdapter state and send the grouped tx
 */
export const sendTransactionReducerTXs = () => {
    return async (dispatch, getState) => {

        const state = getState();
        await _prepTxObjectsToAliceNetAdapter(state);

        log.debug("AliceNetAdapter TxOuts pending: ", aliceNetAdapter.txOuts.get());

        // Create the fee input
        let feePayerWallet = state.transaction.feePayer.wallet;
        let txFee = state.transaction.fees.txFee;

        log.debug("Fee Payer Wallet && txFee for sendTx:", {
            feePayerWallet: feePayerWallet,
            txFee: txFee,
        });

        await aliceNetAdapter.wallet().Transaction.createTxFee(feePayerWallet.address, feePayerWallet.curve, txFee);

        // First create the transaction
        let create = await aliceNetAdapter.createTx();
        if (create.error) {
            return { error: "Unable to create transaction: " + String(create.error) }
        }
        // If OK, send it
        let tx = await aliceNetAdapter.sendTx();

        try {
            // Grab any owners, and send to balance updater for those addresses
            let txDatas = utils.transaction.parseRpcTxObject(tx.txDetails);
            // Wrap in nested function to await within the context of this function only.
            const sendForBalances = async (ownersToBalFetch) => {
                // Give the network a few seconds to catch up after the success
                await genericUtils.waitFor(3000, "PostTX:UpdateBal");
                for (let i = 0; i < ownersToBalFetch.length; i++) {
                    let owner = ownersToBalFetch[i];
                    await dispatch(getAndStoreLatestBalancesForAddress(owner));
                    // await dispatch(getAndStoreRecentTXsForAddress(owner)); // Only if we want to refetch RecentTXs ( API Intensive )
                }
            };

            let owners = [];
            const aliceNetWalletInstance = getAliceNetWalletInstance();
            for (let i = 0; i < txDatas.vouts.length; i++) {
                let vout = txDatas.vouts[i];
                let extractedOwner = (await aliceNetWalletInstance.Transaction.Utils.extractOwner(vout.owner))[2];
                if (utils.wallet.userOwnsAddress(extractedOwner)) {
                    owners.push(extractedOwner);
                }
            }
            sendForBalances(owners);
        } catch (ex) {
            log.error("Unable to parse returned tx for owners to aggregate balances. Did tx fail? -- Error: " + ex);
        }

        // Set latest tx to lastSentAndMinedTx in transaction reducer
        dispatch(TRANSACTION_ACTIONS.setLastSentAndMinedTx(tx));
        dispatch(TRANSACTION_ACTIONS.toggleStatus());
        // Reset last received lastSentTxHash for next cycle
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_LAST_SENT_TX_HASH, payload: "" });
        // Reset TxFeePayer for next cycles
        dispatch(TRANSACTION_ACTIONS.clearFeePayer());
        // Remove any user input or store fees from fee state
        dispatch(TRANSACTION_ACTIONS.resetFeeState());

        return tx;
    };
};
