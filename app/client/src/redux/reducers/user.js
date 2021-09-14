import { USER_ACTION_TYPES } from '../constants/_constants';

// The user reducer contains all information regarding the user and their wallets state
const initialUserState = {
    account_locked: false,
    has_vault: false, // Electron store is read for the plainValue of vault to see if it exists
}

/* User Reducer */
export default function userReducer(state = initialUserState, action) {

    switch (action.type) {

        case USER_ACTION_TYPES.MARK_ACCOUNT_LOCKED:
            return Object.assign({}, state, {
                account_locked: true,
            });

        case USER_ACTION_TYPES.MARK_ACCOUNT_UNLOCKED:
            return Object.assign({}, state, {
                account_locked: false,
            });

        case USER_ACTION_TYPES.SET_HAS_VAULT:
            return Object.assign({}, state, {
                has_vault: false,
            });

        default: return state;

    }

}