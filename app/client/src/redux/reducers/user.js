import { USER_ACTION_TYPES } from '../constants/_constants';

// The user reducer contains all information regarding the user and their wallets state
const initialUserState = {
    hasAccount: false,
    accountLocked: true,
    wallets: {
        internal: [],
        external: [],
    },
}

/* User Reducer */
export default function userReducer(state = initialUserState, action) {

    switch (action.type) {

        case USER_ACTION_TYPES.MARK_ACCOUNT_LOCKED:
            return Object.assign({}, state, {
                accountLocked: true,
            });

        case USER_ACTION_TYPES.MARK_ACCOUNT_UNLOCKED:
            return Object.assign({}, state, {
                accountLocked: false,
            });

        default: return state;

    }

}