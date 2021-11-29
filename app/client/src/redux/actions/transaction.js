import { TRANSACTION_ACTION_TYPES } from '../constants/_constants';
import { default_log as log } from 'log/logHelper';

//////////////////////////////////
/* External Async Action Calls */
/////////////////////////////////

/**
 * Toggle loading status
 * @param { number } fee - The selected fee
 * @returns null
 */
export function setPrioritizationFee(fee) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_PRIORITIZATION_FEE, payload: fee });
        dispatch(parseAndUpdateFees());
    }
}

/**
 * Set the wallet object of the fee payer
 * @param { Object } wallet - Redux wallet state object
 * @param { Boolean } userOverride - Sets the override flag so that parseDefaultFeePayer() does not update the fee when called
 */
export function setFeePayer(wallet, over_ride = false) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_FEE_PAYER, payload: { wallet: wallet, over_ride: over_ride } });
    }
}

/**
 * Clears the Fee Payer -- Generally called post tx send
 * @returns 
 */
export function clearFeePayer() {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.CLEAR_FEE_PAYER });
    }
}

/**
 * Parses txList and sets the default fee payer to position 0 of the list if it exists unless over_ride is set 
 * -- Generally called after changes to the transaction list have been made.
 */
export function parseDefaultFeePayer() {
    return async function (dispatch, getState) {
        const state = getState();
        const transactionList = state.transaction.list;
        const over_ride = state.transaction.feePayer.over_ride;

        // If the over_ride is set ( Manual Fee Payer Wallet Has Been Selected ), do not update through the parseDefaultFeePayer
        if (over_ride) { return }
        // Don't update the default if none exist
        if (transactionList.length === 0) {
            log.warn("parseDefaultFeePayer() called without a populated transaction list in the transaction reducer. This shouldn't happen!")
            return
        }

        // Else, update to the first entry position 
        const wallets = [...state.vault.wallets.internal, ...state.vault.wallets.external]
        const firstEntry = transactionList[0];

        // Grab the wallet to set as the fee payer and dispatch it -- This should always exist and is failsafed by the above length constraint on transactionList
        const walletToSet = wallets.filter(wallet => wallet.address === firstEntry.from)?.[0];
        dispatch(setFeePayer(walletToSet));
    }
}

/**
 * Toggle loading status
 * @returns null
 */
export function toggleStatus() {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.TOGGLE_STATUS });
    }
}

/**
 * Saves the address chosen for the change to be returned to
 * @param { string } address - A valid Web3 address
 * @returns null
 */
export function saveChangeReturnAddress(address) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SAVE_CHANGE_RETURN_ADDRESS, payload: address });
    }
}

/**
 * Goes back to initialization details
 * @returns null
 */
export function clearList() {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_PRIORITIZATION_FEE, payload: 0 });
        dispatch({ type: TRANSACTION_ACTION_TYPES.CLEAR_LIST });
    }
}

/**
 * Adds a data/value store -- Additionally dispatches parse for default fee payer request
 * @param { Object } transaction - A data/value store
 * @returns null
 */
export function addStore(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.ADD_TO_LIST, payload: transaction });
        dispatch(parseDefaultFeePayer());
        dispatch(parseAndUpdateFees());
    }
}

/**
 * Edits a data/value store -- Additionally dispatches parse for default fee payer request
 * @param { Object } transaction - A data/value store
 * @returns null
 */
export function editStore(transaction) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.UPDATE_FROM_LIST, payload: transaction });
        dispatch(parseDefaultFeePayer());
    }
}

/**
 * Removes an item from the list
 * @param { int } index - Index of the element
 * @returns null
 */
export function removeItem(index) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.REMOVE_FROM_LIST, payload: index });
        dispatch(parseAndUpdateFees());
    }
}

export function setLastSentAndMinedTx(tx) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_LAST_SENT_MINED_TX, payload: tx });
    }
}

export function setLastSentTxHash(txHash) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.SET_LAST_SENT_TX_HASH, payload: txHash });
    }
}

export function addPolledTx(tx) {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.ADD_POLLED_TX, payload: tx });
    }
}

export function clearPolledTxs() {
    return async function (dispatch) {
        dispatch({ type: TRANSACTION_ACTION_TYPES.CLEAR_POLLED_TX });
    }
}

/**
 * Parse and update any passed fees to human readable state in the reducer -- Additionally calculates any fee changes when called
 * -- Should be called when making adjustments to transaction.list or priotization fee changes
 * @param { Object } rpcFees 
 * @property { BigIntHexString } rpcFees.atomicSwapFee - Atomic Swap fee from RPC.getFees()
 * @property { BigIntHexString } rpcFees.dataStoreFee - Data Store Fee from RPC.getFees()
 * @property { BigIntHexString } rpcFees.valueStoreFee - Value Store Fee from RPC.getFees()
 * @property { BigIntHexString } rpcFees.minTxFee - Min TX Fee from RPC.getFees()
 * @property { Integer } rpcFees.prioritizationFee - Prioritization fee to use if any -- Will use existing state if available for calculation
 */
export function parseAndUpdateFees(rpcFees) {
    return async function (dispatch, getState) {

        const state = getState();

        const madNetFees = rpcFees ? rpcFees : state.adapter.madNetAdapter.fees;
        const txList = state.transaction.list;

        console.log(madNetFees);

        // Convert RPC Fees to human readable format for transaction reducer state
        Object.keys(madNetFees).map(key => {
            madNetFees[key] = parseInt(madNetFees[key], 16);
        })

        // Build fees from passed paramaters or available state
        let fees = {
            atomicSwapFee: madNetFees.atomicSwapFee, // Hex Parsed Base Atomic Swap Fee from RPC.getFees()
            atomicSwapFees: 0, // Total Fees for all atomicSwap VOUTs in txList
            dataStoreFee: madNetFees.dataStoreFee, // Hex Parsed Base DataStore fee from RPC.getFees()
            dataStoreFees: 0, // Total Fees for all dataStore VOUTs in txList
            valueStoreFee: madNetFees.valueStoreFee, // Hex Parsed Base ValueStore from RPC.getFees()
            valueStoreFees: 0, // Total Fees for all valueStore VOUTs in txList
            minTxFee: madNetFees.minTxFee, // Parsed minimum tx fee
            prioritizationFee: 0, // Any additional priortization fee set by the user
            txFee: 0, // Prioritization + Minimum Fee
            totalFee: 0, // Total TX Fee ( All Store Fees + Min Fee + Prioritization )
        }

        // If the txList > 0, we need to calculate total fees
        if (txList.length > 0) {
            // Add a fee for each instance of the respective tx type to the total type fees
            for (let i = 0; i < txList.length; i++) {
                let tx = txList[i];
                // Is DataStore
                if (tx.type === 1) {
                    fees.dataStoreFees += fees.dataStoreFee;
                }
                // Is ValueStore
                else if (tx.type === 2) {
                    fees.valueStoreFees += fees.valueStoreFee;

                }
                // Is Atomic Swap -- For future use
                else if (tx.type === 3) {
                    fees.atomicSwapFees += fees.atomicSwapFee;
                }
            }
        }

        fees.txFee = fees.minTxFee + fees.prioritizationFee;
        fees.totalFee = fees.txFee + fees.valueStoreFees + fees.dataStoreFees + fees.atomicSwapFees;

        console.log({
            txList: txList,
            fees: fees,
        });

        dispatch({ type: TRANSACTION_ACTION_TYPES.UPDATE_FEES_BY_TYPE, payload: fees })

    }

}