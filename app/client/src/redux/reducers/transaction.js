import { TRANSACTION_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from 'log/logHelper';
import utils, { transactionStatus } from 'util/_util';

export const initialTransactionState = {
    status: transactionStatus.CREATION, //The status reflects the transaction workflow
    list: [], //The list of transactions before being sent to the chain
    prioritizationFee: 0,
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
                prioritizationFee: action.payload,
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

        default:
            return state;

    }

}