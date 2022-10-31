import { contextBridge, ipcRenderer } from "electron";

const fs = require("fs");
const Store = require("secure-electron-store").default;
const BackupStore = require("./BackupStore");

const store = new Store({
    filename: "AliceNetWalletUser",
});

// Used as backup file writer to intermittently create a backup of the main files
const storeBak = new BackupStore({
    filename: "AliceNetWalletUser",
    extension: ".json.bak",
});

contextBridge.exposeInMainWorld("api", {
    store: store.preloadBindings(ipcRenderer, fs),
    storeBak: storeBak.preloadBindings(ipcRenderer, fs),
});
