import { MODAL_ACTION_TYPES } from '../constants/_constants';

// Global overlay/modal visibility and text states
const initialModalState = {
    password_req_modal: false,
    password_req_reason: "",
    password_req_cb: () => {}, // Function for password request modal cb
    export_privK_modal: false, // Is this modal open?
    remove_wallet_modal: false, // Is this modal open?
    rename_wallet_modal: false, // Is this modal open?
    wallet_action_target: false, // What is the target wallet for the action modals
}

/* Modal Reducer */
export default function modalReducer(state = initialModalState, action) {

    switch (action.type) {

        case MODAL_ACTION_TYPES.OPEN_PW_REQUEST:
            return Object.assign({}, state, {
                password_req_modal: true,
                password_req_reason: action.payload.reason,
                password_req_cb: action.payload.cb,
            });

        case MODAL_ACTION_TYPES.CLOSE_PW_REQUEST:
            return Object.assign({}, state, {
                password_req_modal: false,
                password_req_reason: "",
                password_req_cb: () => { },
            });

        case MODAL_ACTION_TYPES.OPEN_RENAME_WALLET:
            return Object.assign({}, state, {
                rename_wallet_modal: true,
                wallet_action_target: action.payload
            });

        case MODAL_ACTION_TYPES.CLOSE_RENAME_WALLET:
            return Object.assign({}, state, {
                rename_wallet_modal: false,
                wallet_action_target: false,
            });

        case MODAL_ACTION_TYPES.OPEN_REMOVE_WALLET:
            return Object.assign({}, state, {
                remove_wallet_modal: true,
                wallet_action_target: action.payload,
            });

        case MODAL_ACTION_TYPES.CLOSE_REMOVE_WALLET:
            return Object.assign({}, state, {
                remove_wallet_modal: false,
                wallet_action_target: false,
            });

        case MODAL_ACTION_TYPES.OPEN_XPORT_PRIVK:
            return Object.assign({}, state, {
                export_privK_modal: true,
                wallet_action_target: action.payload,
            });

        case MODAL_ACTION_TYPES.CLOSE_XPORT_PRIVK:
            return Object.assign({}, state, {
                export_privK_modal: false,
                wallet_action_target: false,
            });

        default: return state;

    }

}