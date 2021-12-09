import { TRANSACTION_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from 'log/logHelper';
import utils, { transactionStatus } from 'util/_util';

export const initialTransactionState = {
    status: transactionStatus.CREATION, //The status reflects the transaction workflow
    list: [], //The list of transactions before being sent to the chain
    fees: { // Human readable fees -- The fees to be used by the adapter are in adapter reducer as HEX values
        atomicSwapFee: 0, // Hex Parsed Base Atomic Swap Fee from RPC.getFees()
        atomicSwapFees: 0, // Total Fees for all atomicSwap VOUTs in txList
        dataStoreFee: 0, // Hex Parsed Base DataStore fee from RPC.getFees()
        dataStoreFees: 0, // Total Fees for all dataStore VOUTs in txList
        depositFees: 0, // Any fees surrounding deposits for data stores
        valueStoreFee: 0, // Hex Parsed Base ValueStore from RPC.getFees()
        valueStoreFees: 0, // Total Fees for all valueStore VOUTs in txList
        minTxFee: 0, // Parsed minimum tx fee
        prioritizationFee: 0, // Any additional priortization fee set by the user
        txFee: 0, // Prioritization + Minimum Fee
        totalFee: 0, // Total TX Fee ( All Store Fees + Min Fee + Prioritization )
        errors: [], // Any fee estimation errors -- Strings of error messages for the user to resolve
    },
    feePayer: {
        wallet: null, // Wallet object of the fee payer, and override notification -- Should exist in internal/external vault state wallets and set through Adjust TX Fee Modal
        over_ride: false, // Has the wallet been manually set, and should not be updated by parseDefaultFeePayer() in transaction.actions?
    },
    changeReturnAddress: null, //The address to which the change might be returned if any
    lastSentAndMinedTx: false, // Last mined tx data
    lastSentTxHash: "", // Last sent TX Hash -- Received from RPC - send-transaction on successful send -- Can be used to check pending TX
    polledTxs: [], // TXs that have been polled manually via FindTX tab
}

/* Transaction Reducer */
export default function transactionReducer(state = initialTransactionState, action) {

    switch (action.type) {

        case TRANSACTION_ACTION_TYPES.CLEAR_LIST:
            log.debug("Clearing transactions list");
            return Object.assign({}, state, {
                list: [],
            });

        case TRANSACTION_ACTION_TYPES.TOGGLE_STATUS:
            log.debug("Toggle transaction status");
            return Object.assign({}, state, {
                status: utils.transaction.getNextTransactionStatus(state.status),
            });

        case TRANSACTION_ACTION_TYPES.SAVE_CHANGE_RETURN_ADDRESS:
            log.debug("Saving change return address", action.payload);
            return Object.assign({}, state, {
                changeReturnAddress: action.payload,
            });

        case TRANSACTION_ACTION_TYPES.SET_PRIORITIZATION_FEE:
            log.debug("Updating prioritization fee", action.payload);
            return Object.assign({}, state, {
                fees: { ...state.fees, prioritizationFee: action.payload },
            });

        case TRANSACTION_ACTION_TYPES.UPDATE_FEES_BY_TYPE:
            log.debug("Updating fees by keyed object: ", action.payload);
            if (!action.payload) {
                throw new Error("UPDATE_FEES_BY_TYPE called without payload -- Always pass a payload to this action.");
            }
            return Object.assign({}, state, {
                fees: {
                    atomicSwapFee: typeof action.payload.atomicSwapFee !== 'undefined' ? action.payload.atomicSwapFee : state.fees.atomicSwapFee,
                    atomicSwapFees: typeof action.payload.atomicSwapFees !== 'undefined' ? action.payload.atomicSwapFees : state.fees.atomicSwapFees,
                    dataStoreFee: typeof action.payload.dataStoreFee !== 'undefined' ? action.payload.dataStoreFee : state.fees.dataStoreFee,
                    dataStoreFees: typeof action.payload.dataStoreFees !== 'undefined' ? action.payload.dataStoreFees : state.fees.dataStoreFees,
                    depositFees: typeof action.payload.depositFees !== 'undefined' ? action.payload.depositFees : state.fees.dataStoreFees,
                    valueStoreFee: typeof action.payload.valueStoreFee !== 'undefined' ? action.payload.valueStoreFee : state.fees.valueStoreFee,
                    valueStoreFees: typeof action.payload.valueStoreFees !== 'undefined' ? action.payload.valueStoreFees : state.fees.valueStoreFees,
                    minTxFee: typeof action.payload.minTxFee !== 'undefined' ? action.payload.minTxFee : state.fees.minTxFee,
                    prioritizationFee: typeof action.payload.prioritizationFee !== 'undefined' ? action.payload.prioritizationFee : state.fees.prioritizationFee,
                    txFee: typeof action.payload.txFee !== 'undefined' ? action.payload.txFee : state.fees.txFee,
                    totalFee: typeof action.payload.totalFee !== 'undefined' ? action.payload.totalFee : state.fees.totalFee,
                    errors: typeof action.payload.errors !== 'undefined' ? action.payload.errors : state.fees.errors,
                },
            });

        case TRANSACTION_ACTION_TYPES.ADD_TO_LIST:
            log.debug("Adding a transaction to the list", action.payload);
            return Object.assign({}, state, {
                list: state.list.concat([action.payload]),
            });

        case TRANSACTION_ACTION_TYPES.UPDATE_FROM_LIST:
            log.debug("Updating a transaction from the list", action.payload);
            return Object.assign({}, state, {
                list: state.list.map((item, index) => {
                    if (index === action.payload.index) {
                        return action.payload;
                    }
                    return item;
                }),
            });

        case TRANSACTION_ACTION_TYPES.SET_LAST_SENT_MINED_TX:
            log.debug("Updating latest sent and mined tx: ", action.payload);
            return Object.assign({}, state, {
                lastSentAndMinedTx: action.payload,
            });

        case TRANSACTION_ACTION_TYPES.REMOVE_FROM_LIST:
            log.debug("Removing an element from the list at position", action.payload);
            return Object.assign({}, state, {
                list: state.list.filter((value, index) => index !== action.payload),
            });

        case TRANSACTION_ACTION_TYPES.SET_LAST_SENT_TX_HASH:
            log.debug("Setting last sent tx hash", action.payload);
            return Object.assign({}, state, {
                lastSentTxHash: action.payload,
            });

        case TRANSACTION_ACTION_TYPES.ADD_POLLED_TX:
            log.debug("Adding polled tx:", action.payload);
            return Object.assign({}, state, {
                polledTxs: [...state.polledTxs, action.payload],
            });

        case TRANSACTION_ACTION_TYPES.CLEAR_POLLED_TX:
            log.debug("Clearing polled txs:");
            return Object.assign({}, state, {
                polledTxs: [],
            });

        case TRANSACTION_ACTION_TYPES.SET_FEE_PAYER:
            log.debug("Setting feePayer to:", action.payload);
            return Object.assign({}, state, {
                feePayer: {
                    wallet: action.payload.wallet,
                    over_ride: action.payload.over_ride
                },
            });

        case TRANSACTION_ACTION_TYPES.CLEAR_FEE_PAYER:
            log.debug("Clearing feePayer");
            return Object.assign({}, state, {
                feePayer: {
                    wallet: null,
                    over_ride: false,
                }
            });

        default:
            return state;

    }

}