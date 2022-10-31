import { USER_ACTION_TYPES } from "../constants/_constants";
import { curveTypes } from "util/_util";
import { reduxState_logger as log } from "../../log/logHelper.js";

// The user reducer contains all information regarding the user and their wallets state
const initialUserState = {
    potential_seed_phrase: "", // Used during seed generation for vault
    desired_hd_curve: curveTypes.SECP256K1, // Used to determine which curve the user would like to use on their HD Vault
};

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

        default:
            return state;
    }
}
