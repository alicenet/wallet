const { ipcRenderer } = require("electron");
const pathModule = require("path");

const writeBakFileRequest = "WriteBakFile-Request";
const writeBakFileResponse = "WriteBakFile-Response";
const readBakFileRequest = "ReadBakFile-Request";
const readBakFileResponse = "ReadBakFile-Request";

// Backup Store Shim -- Behaves similar to secure-electron-store -- Only provides one write channel , manual restoration is required by user
module.exports = class BackupStore {

    constructor(options) {
        this.filename = "MadWalletEnc.bak";
        this.initialFileValue;
        this.validSendChannels = [writeBakFileRequest, readBakFileRequest];
        this.validReceiveChannels = [writeBakFileResponse, readBakFileResponse];

        console.log(options)
        
        // Merge options
        if (typeof options !== "undefined") {
            this.options = Object.assign(this.options, options);
        }

        // ALA electron-store for isolating run in only one process

        // Only run the following code in the renderer
        // process; we can determine if this is the renderer
        // process if we haven't set a new path from our options
        if (typeof options === "undefined" || options.path !== "") {
            try {
                const arg = process.argv.filter(p => p.indexOf("storePath:") >= 0)[0];
                console.log(arg);
                this.path = arg.substr(arg.indexOf(":") + 1);
            } catch (error) {
                throw new Error(`Could not find property 'additionalArguments' value beginning with 'storePath:' in your BrowserWindow. Please ensure this is set! Error: ${error}`);
            }
        }

        this.filePath = pathModule.join(options.path, `${this.filename}`);


    }

    // Main IPC Bindings
    mainBindings(ipcMain, browserWindow, fs) {

        ipcMain.on(writeBakFileRequest, (IpcMainEvent, args) => {
            console.log("WRITE BAK FILE REQ");
            console.log("ARGS", args);

            try {
                console.log("path", path);
                let currentConfig = fs.readFileSync("" + "/" + "MadWalletEnc.json");
                console.log("Currentfile: ", currentConfig);
            } catch (ex) {
                console.error(ex);
            }

        });

        ipcMain.on(readBakFileRequest, (IpcMainEvent, args) => {
            console.log("READ BAK FILE REQ");
        });

    }

    // Preload IPC Bindings
    preloadBindings(ipcRenderer, fs) {


        // Attempt to get initial file data
        try {
            this.initialFileValue = fs.readFileSync(this.filePath);
            console.log("OK: Vault Backup File MadWalletEnc.bak exists!");
        } catch (ex) {
            // Doesn't exist -- Leave it be
            if (ex.code === "ENOENT") {
                this.initialFileValue = null;
                console.log("WARNING: Vault Backup File MadWalletEnc.bak does not exist. First run?");
            }
        }

        return {
            initialValue: this.initialFileValue,
            send: (channel, jsonObj ) => {
                if (this.validSendChannels.includes(channel)) {
                    switch (channel) {
                        // Save Data to MadWalletEnc.bak
                        case writeBakFileRequest: ipcRenderer.send(writeBakFileRequest, { jsonObj }); break;
                        // Read contents of MadWalletEnc.bak - TBD if needed
                        // case readBakFileRequest: ipcRenderer.send(readBakFileRequest, {}); break;
                    }
                }
            },
            onReceive: (channel, func) => {
                if (this.validReceiveChannels.includes(channel)) {
                    ipcRenderer.on(channel, (event, args) => {
                        switch (channel) {
                            case writeBakFileResponse: console.log(`Write bakFile success: ${args.success}`); break;
                            // case readBakFileResp: console.log(`Read bakFile success: ${args.success}`); break;
                        }
                        func(args);
                    })

                }
            }
        }

    }

}