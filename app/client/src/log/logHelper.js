import log from 'loglevel';

const GLOBAL_LEVEL = false; // "SILENT"" to silence all logs exported from this module

export const ADDITIONAL_LOG_OPTS = {
    LOG_ELECTRON_MESSENGER_SUBSCRIBER_EVENTS: false,
}

// -- DO NOT EDIT BELOW UNLESS ADDING LOGGERS -- //

const logLevels = {
    ELECTRON_STORE_HELPER: "DEBUG",
    ELECTRON_STORE_MESSENGER: "DEBUG",
    REDUX_STATE: "DEBUG",
    UTILS_WALLET: "DEBUG"
}

export const logModules = {
    ELECTRON_STORE_HELPER: "ELECTRON_STORE_HELPER", // store/electronStoreHelper.js
    ELECTRON_STORE_MESSENGER: "ELECTRON_STORE_HELPER", // store/electronStoreHelper.js
    REDUX_STATE: "REDUX_STATE",  // All things redux state, primarily reducer updates
    UTILS_WALLET: "UTILS_WALLET" // util/wallet
}

const getSetLogLevel = (moduleType) => {
    log.getLogger(moduleType).setLevel(GLOBAL_LEVEL || logLevels[moduleType]);
    return log.getLogger(moduleType);
};

export const electronStoreHelper_logger = getSetLogLevel(logModules.ELECTRON_STORE_HELPER);
export const electronStoreMessenger_logger = getSetLogLevel(logModules.ELECTRON_STORE_MESSENGER);
export const reduxState_logger = getSetLogLevel(logModules.REDUX_STATE);
export const utilsWallet_logger = getSetLogLevel(logModules.UTILS_WALLET);
