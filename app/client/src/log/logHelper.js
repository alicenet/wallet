import log from 'loglevel';

const GLOBAL_LEVEL = false; // "SILENT"" to silence all logs exported from this module

export const ADDITIONAL_LOG_OPTS = {
    LOG_ELECTRON_MESSENGER_SUBSCRIBER_EVENTS: false,
}

 // -- DO NOT EDIT BELOW UNLESS ADDING LOGGERS -- //

const logLevels = {
    ELECTRON_STORE_HELPER: "DEBUG",
    ELECTRON_STORE_MESSENGER: "DEBUG",
    REDUX_STATE: "DEBUG"
}

export const logModules = {
    ELECTRON_STORE_HELPER: "ELECTRON_STORE_HELPER", // store/electronStoreHelper.js
    ELECTRON_STORE_MESSENGER: "ELECTRON_STORE_HELPER", // store/electronStoreHelper.js
    REDUX_STATE: "REDUX_STATE",  // All things redux state, primarily reducer updates
}

log.getLogger(logModules.ELECTRON_STORE_HELPER).setLevel(GLOBAL_LEVEL || logLevels.ELECTRON_STORE_HELPER); // Set for status updates on electron-store I/O
log.getLogger(logModules.ELECTRON_STORE_MESSENGER).setLevel(GLOBAL_LEVEL || logLevels.ELECTRON_STORE_MESSENGER); // Only needs to be set if experiencing troubles with the messenger itself
log.getLogger(logModules.REDUX_STATE).setLevel(GLOBAL_LEVEL || logLevels.REDUX_STATE); // Set for status updates on redux state updates || Suggest using Redux Dev Tools in browser for debugging further

export const getLogger = (logType) => log.getLogger(logType);

export default log;