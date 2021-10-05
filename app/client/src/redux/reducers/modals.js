import { MODAL_ACTION_TYPES } from '../constants/_constants';

// Global overlay/modal visibility and text states
const initialModalState = {
    global_error_modal: false, // Is the global error modal visible?
    global_error_text: "", // Set as text to display within the error modal
    password_req_modal: false,
    password_req_reason: "",
    password_req_cb: () => { }, // Function for password request modal cb
}

/* Modal Reducer */
export default function modalReducer(state = initialModalState, action) {

    switch (action.type) {

        case MODAL_ACTION_TYPES.SET_GLOBAL_ERROR:
            return Object.assign({}, state, {
                global_error_modal: true,
                global_error_text: action.payload,
            });

        case MODAL_ACTION_TYPES.CLEAR_GLOBAL_ERROR:
            return Object.assign({}, state, {
                globalErrorModal: false,
                global_error_text: "",
            });

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
                password_req_cb: () => {},
            }); 

        default: return state;

    }

}