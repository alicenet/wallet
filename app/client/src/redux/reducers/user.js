import { USER_ACTION_TYPES } from '../constants/_constants';

// The user reducer contains all information regarding the user and their wallets state
const initialUserState = {
    account_locked: false,
    has_vault: false,
    vault_pass_hash: "", // A vault password hash is stored for preflights
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

        default: return state;

    }

}