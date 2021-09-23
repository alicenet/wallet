import { USER_ACTION_TYPES } from '../constants/_constants';
import { curveTypes } from 'util/_util';
import { reduxState_logger as log } from '../../log/logHelper.js'

// The user reducer contains all information regarding the user and their wallets state
const initialUserState = {
    potential_seed_phrase: "",
    desired_hd_curve: curveTypes.SECP256K1,
    keystore_to_load: false, // Keystore Data To Load -- Hasn't been unencrypted
    loaded_keystore: false, // Last loaded or generated keystore -- Used to update other states as needed
}

/* User Reducer */
export default function userReducer(state = initialUserState, action) {

    switch (action.type) {

        case USER_ACTION_TYPES.SET_POTENTIAL_SEED_PHRASE:
            log.debug(["User Update to potential_seed_phrase", action.payload]);
            return Object.assign({}, state, {
                potential_seed_phrase: action.payload,
            });

        case USER_ACTION_TYPES.SET_DESIRED_HD_CURVE:
            log.debug(["User Update to desired_hd_curve:", action.payload]);
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