import log from 'loglevel';

// Log Module Names
export const logModules = {
    ELECTRON_STORE_HELPER: "ELECTRON_STORE_HELPER", // store/electronStoreHelper.js
    ELECTRON_STORE_MESSENGER: "ELECTRON_STORE_HELPER", // store/electronStoreHelper.js
    REDUX_STATE: "REDUX_STATE",  // All things redux state, primarily reducer updates
    UTILS_WALLET: "UTILS_WALLET", // util/wallet
    WALLET_MANAGER_MIDDLEWARE: "WALLET_MANAGER_MIDDLEWARE" // redux/middleware/WalletManagerMiddleware.js
}

const GLOBAL_LEVEL = false; // "SILENT"" to silence all logs exported from this module
const EXCLUSIVE = logModules.WALLET_MANAGER_MIDDLEWARE // Flag a module name for exclusive logging

// Log Modules Levels -- Set as needed
const logLevels = {
    ELECTRON_STORE_HELPER: exclusityCheck("DEBUG", logModules.ELECTRON_STORE_HELPER),
    ELECTRON_STORE_MESSENGER: exclusityCheck("DEBUG", logModules.ELECTRON_STORE_MESSENGER),
    REDUX_STATE: exclusityCheck("DEBUG", logModules.REDUX_STATE),
    UTILS_WALLET: exclusityCheck("DEBUG", logModules.UTILS_WALLET),
    WALLET_MANAGER_MIDDLEWARE: exclusityCheck("DEBUG", logModules.WALLET_MANAGER_MIDDLEWARE),
}

// Addition Log Options -- Set as needed
export const ADDITIONAL_LOG_OPTS = {
    LOG_ELECTRON_MESSENGER_SUBSCRIBER_EVENTS: false,
}

function exclusityCheck(level, moduleName) { return(!!EXCLUSIVE && EXCLUSIVE === moduleName ? "TRACE" : !EXCLUSIVE ? level : "SILENT"); }

const getSetLogLevel = (moduleType) => {
    log.getLogger(moduleType).setLevel(GLOBAL_LEVEL || logLevels[moduleType]);
    return log.getLogger(moduleType);
};

export const electronStoreHelper_logger = getSetLogLevel(logModules.ELECTRON_STORE_HELPER);
export const electronStoreMessenger_logger = getSetLogLevel(logModules.ELECTRON_STORE_MESSENGER);
export const reduxState_logger = getSetLogLevel(logModules.REDUX_STATE);
export const utilsWallet_logger = getSetLogLevel(logModules.UTILS_WALLET);
export const walletManMiddleware_logger = getSetLogLevel(logModules.WALLET_MANAGER_MIDDLEWARE);
