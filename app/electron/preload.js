const {
    contextBridge,
    ipcRenderer,
} = require("electron");
const fs = require("fs");
const Store = require("secure-electron-store").default;
const store = new Store({
    filename: "MadWalletEnc",
    unprotectedFilename: "MadWalletCfg",
  });

contextBridge.exposeInMainWorld(
    "api", {
        store: store.preloadBindings(ipcRenderer, fs)
    }
);