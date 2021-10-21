import { INTERFACE_ACTION_TYPES } from '../constants/_constants';

/**
 * Toggle the current state of the global loading boolean within the interfaceReducer
 * @param { Boolean } isLoading - Is a global loading event occurring | set to occur ?
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function toggleGlobalLoadingBool(isLoading) {
    return { type: INTERFACE_ACTION_TYPES.TOGGLE_GLOBAL_LOADING_BOOL, payload: typeof isLoading !== "undefined" ? isLoading : undefined }
}

/**
 * Updated the active tab pane index
 * @param { Integer } activeTabPane - Active tab pane index number
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function updateActiveTabPane(activeTabPane) {
    return { type: INTERFACE_ACTION_TYPES.DEBUG_UPDATE_ACTIVE_TAB_PANE, payload: typeof activeTabPane !== "undefined" ? activeTabPane : undefined }
}

/**
 * Toggle the current state of showDebug within the interfaceReducer
 * @param { Boolean } showDebug - Should we show the redux state debug screen
 * @returns { Object } - Action object to be passed as first parameter within Redux.dispatch()
 */
export function DEBUG_toggleShowDebug(showDebug) {
    return { type: INTERFACE_ACTION_TYPES.DEBUG_TOGGLE_SHOW_DEBUG, payload: typeof showDebug !== "undefined" ? showDebug : undefined }
}