import { USER_ACTION_TYPES } from '../constants/_constants';
import { curveTypes } from 'util/_util';

// The user reducer contains all information regarding the user and their wallets state
const initialUserState = {
    account_locked: false,
    has_vault: false, // Electron store is read for the plainValue of vault to see if it exists
    potential_seed_phrase: "",
    desired_hd_curve: curveTypes.SECP256K1,
    keystore_to_load: false, // Keystore Data To Load -- Hasn't been unencrypted
    loaded_keystore: false, // Last loaded or generated keystore -- Used to update other states as needed
}

/* User Reducer */
export default function userReducer(state = initialUserState, action) {

    switch (action.type) {

        // General Account State
        //////-----
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

        // Potential Mnemonic and HD Curve // -- Used for new vault generation / loading //
        //////-----
        case USER_ACTION_TYPES.SET_POTENTIAL_SEED_PHRASE:
            return Object.assign({}, state, {
                potential_seed_phrase: action.payload,
            });

        case USER_ACTION_TYPES.SET_DESIRED_HD_CURVE:
            return Object.assign({}, state, {
                desired_hd_curve: action.payload,
            });

        // KEYSTORE HANDLING //
        //////-----
        case USER_ACTION_TYPES.SET_KEYSTORE_TO_LOAD:
            return Object.assign({}, state, {
                loaded_keystore: action.payload,
            });

        case USER_ACTION_TYPES.CLEAR_LOADED_KEYSTORE:
            return Object.assign({}, state, {
                loaded_keystore: false,
            })

        case USER_ACTION_TYPES.SET_LOADED_KEYSTORE:
            return Object.assign({}, state, {
                keystore_to_load: action.payload,
            });

        default: return state;

    }

}