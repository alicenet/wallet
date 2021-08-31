import { MODAL_ACTION_TYPES } from '../constants/_constants';

// Global overlay/modal visibility and text states
const initialModalState = {
    globalErrorModal: false, // Is the global error modal visible?
    globalErrorText: "", // Set as text to display within the error modal
}

/* Modal Reducer */
export default function modalReducer(state = initialModalState, action) {

    switch (action.type) {

        case MODAL_ACTION_TYPES.SET_GLOBAL_ERROR:
            return Object.assign({}, state, {
                globalErrorModal: true,
                globalErrorText: action.payload,
            });

        case MODAL_ACTION_TYPES.CLEAR_GLOBAL_ERROR:
            return Object.assign({}, state, {
                globalErrorModal: false,
                globalErrorText: "",
            });

        default: return state;

    }

}