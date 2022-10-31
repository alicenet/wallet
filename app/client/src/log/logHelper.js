// Micro logger class
class Logger {
    constructor(level) {
        this.LOG_LEVELS = {
            trace: 1,
            debug: 2,
            log: 3,
            info: 3,
            warn: 4,
            error: 5,
        };
        this.level = level;
        this.log = this._getLogger("log");
        this.info = this._getLogger("info");
        this.warn = this._getLogger("warn");
        this.debug = this._getLogger("debug");
        this.trace = this._getLogger("trace");
        this.error = this._getLogger("error");
    }

    // Only build logger if it's level is >= the requirement for logging
    _getLogger(type) {
        if (this.LOG_LEVELS[type] >= this.LOG_LEVELS[this.level]) {
            return console[type].bind(console);
        } else {
            return () => {}; // Blank if silent
        }
    }
}

// Log Module Names
export const logModules = {
    DEFAULT: "DEFAULT_LOG",
    ELECTRON_STORE_HELPER: "ELECTRON_STORE_HELPER", // store/electronStoreHelper.js
    ELECTRON_STORE_MESSENGER: "ELECTRON_STORE_HELPER", // store/electronStoreHelper.js
    REDUX_STATE: "REDUX_STATE", // All things redux state, primarily reducer updates
    UTILS_WALLET: "UTILS_WALLET", // util/wallet
    WALLET_MANAGER_MIDDLEWARE: "WALLET_MANAGER_MIDDLEWARE", // redux/middleware/WalletManagerMiddleware.js
};

const GLOBAL_LEVEL = false; // "SILENT"" to silence all logs exported from this module
const EXCLUSIVE = false; // logModules.WALLET_MANAGER_MIDDLEWARE // Flag a module name for exclusive logging

// Log Modules Levels -- Set as needed
const logLevels = {
    DEFAULT: exclusityCheck("debug", logModules.DEFAULT),
    ELECTRON_STORE_HELPER: exclusityCheck(
        "debug",
        logModules.ELECTRON_STORE_HELPER
    ),
    ELECTRON_STORE_MESSENGER: exclusityCheck(
        "debug",
        logModules.ELECTRON_STORE_MESSENGER
    ),
    REDUX_STATE: exclusityCheck("debug", logModules.REDUX_STATE),
    UTILS_WALLET: exclusityCheck("debug", logModules.UTILS_WALLET),
    WALLET_MANAGER_MIDDLEWARE: exclusityCheck(
        "debug",
        logModules.WALLET_MANAGER_MIDDLEWARE
    ),
};

// Addition Log Options -- Set as needed
export const ADDITIONAL_LOG_OPTS = {
    LOG_ELECTRON_MESSENGER_SUBSCRIBER_EVENTS: false,
};

function exclusityCheck(level, moduleName) {
    return !!EXCLUSIVE && EXCLUSIVE === moduleName
        ? "TRACE"
        : !EXCLUSIVE
        ? level
        : "SILENT";
}

const getSetLogLevel = (moduleType) => {
    return new Logger(GLOBAL_LEVEL || logLevels[moduleType]);
};

export const default_log = new Logger(GLOBAL_LEVEL);
export const electronStoreHelper_logger = getSetLogLevel(
    logModules.ELECTRON_STORE_HELPER
);
export const electronStoreMessenger_logger = getSetLogLevel(
    logModules.ELECTRON_STORE_MESSENGER
);
export const reduxState_logger = getSetLogLevel(logModules.REDUX_STATE);
export const utilsWallet_logger = getSetLogLevel(logModules.UTILS_WALLET);
export const walletManMiddleware_logger = getSetLogLevel(
    logModules.WALLET_MANAGER_MIDDLEWARE
);
