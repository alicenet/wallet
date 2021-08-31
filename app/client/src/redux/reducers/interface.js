import { INTERFACE_ACTION_TYPES } from '../constants/_constants';

// Global UI Component States
const initialInterfaceState = {
    globalLoading: false, // Is there a global loading state?
    showDebug: false // Is the state debug overlay showing?
}

/* Modal Reducer */
export default function interfaceReducer(state = initialInterfaceState, action) {

    switch (action.type) {

        case INTERFACE_ACTION_TYPES.TOGGLE_GLOBAL_LOADING_BOOL:
            return Object.assign({}, state, {
                globalLoading: typeof action.payload !== 'undefined' ? action.payload : !state.globalLoading,
            });

        case INTERFACE_ACTION_TYPES.DEBUG_TOGGLE_SHOW_DEBUG:
            return Object.assign({}, state,  {
                showDebug: typeof action.payload !== 'undefined' ? action.payload : !state.showDebug,
            });

        default: return state;

    }

}