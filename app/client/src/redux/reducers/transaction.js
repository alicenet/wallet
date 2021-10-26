import { TRANSACTION_ACTION_TYPES } from '../constants/_constants';
import { reduxState_logger as log } from 'log/logHelper';

// The list of transactions before being sent to the chain
export const initialTransactionState = {
    list: []
}

/* Transaction Reducer */
export default function transactionReducer(state = initialTransactionState, action) {

    switch (action.type) {

        case TRANSACTION_ACTION_TYPES.CLEAR_LIST:
            log.debug("Clearing transactions list");
            return Object.assign({}, state, {
                list: [],
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
                    if(index === action.payload.index) {
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