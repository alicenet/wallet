const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const Store = require('secure-electron-store').default;
const BackupStore = require('./BackupStore');

const store = new Store({
  filename: 'MadWalletUser',
});

// Used as backup file writer to intermittantly create a backup of the main files
const storeBak = new BackupStore({
  filename: 'MadWalletUser',
  extension: '.json.bak',
});

contextBridge.exposeInMainWorld('api', {
  store: store.preloadBindings(ipcRenderer, fs),
  storeBak: storeBak.preloadBindings(ipcRenderer, fs),
});
