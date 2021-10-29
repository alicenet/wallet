import { TRANSACTION_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from 'log/logHelper';
import utils, { transactionStatus } from 'util/_util';

export const initialTransactionState = {
    status: transactionStatus.CREATION, //The status reflects the transaction workflow
    list: [], //The list of transactions before being sent to the chain
    changeReturnAddress: null, //The address to which the change might be returned if any
    receipt: [
        { key: 'TX Hash', value: '0xe000144fdb8d14a833d4b70fd743f16a7039103f' },
        { key: 'Status', value: 'Success | Pending' },
        { key: 'Consumed Tx', value: '0xea145322d844c4e05709e557ca8873b13066dfdda6cc812d717ef5abcf3c6205' },
        { key: 'Consumed TxIdx', value: '0' },
        { key: 'Object Signature', value: '0x03014215fdc2463e389de09460a1d...e699827f9964546cb84118f800' },
        { key: 'Value Stores', value: '123' },
        { key: 'Data Stores', value: '456' },
    ], //Receipt loaded right after the transaction gets completed
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

        case TRANSACTION_ACTION_TYPES.REMOVE_FROM_LIST:
            log.debug("Removing an element from the list at position", action.payload);
            return Object.assign({}, state, {
                list: state.list.filter((value, index) => index !== action.payload),
            });

        default:
            return state;

    }

}