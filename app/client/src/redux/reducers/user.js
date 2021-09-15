import { USER_ACTION_TYPES } from '../constants/_constants';
import { curveTypes } from 'util/_util';

// The user reducer contains all information regarding the user and their wallets state
const initialUserState = {
    account_locked: false,
    has_vault: false, // Electron store is read for the plainValue of vault to see if it exists
    potential_seed_phrase: "",
    desired_hd_curve: curveTypes.SECP256K1,
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

        case USER_ACTION_TYPES.SET_POTENTIAL_SEED_PHRASE:
            return Object.assign({}, state, {
                potential_seed_phrase: action.payload,
            });

        case USER_ACTION_TYPES.SET_DESIRED_HD_CURVE:
            return Object.assign({}, state, {
                desired_hd_curve: action.payload,
            });

        default: return state;

    }

}