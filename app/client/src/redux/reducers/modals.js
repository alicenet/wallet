import { MODAL_ACTION_TYPES } from '../constants/_constants';

// Global overlay/modal visibility and text states
const initialModalState = {
    global_error_modal: false, // Is the global error modal visible?
    global_error_text: "", // Set as text to display within the error modal
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

        default: return state;

    }

}