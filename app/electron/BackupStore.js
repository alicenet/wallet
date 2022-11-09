const pathModule = require("path");

const writeBakFileRequest = "WriteBakFile-Request";
const writeBakFileResponse = "WriteBakFile-Response";

const defaultOptions = {
    path: "",
    filename: "data",
    extension: ".json",
};

// Backup Store Shim -- Behaves similar to secure-electron-store -- Only provides one write channel , manual restoration is required by user at the moment
module.exports = class BackupStore {
    constructor(options) {
        this.options = defaultOptions;
        this.fileData = undefined;
        this.initialFileData = undefined;
        this.initialFileDataParsed = false;

        this.validSendChannels = [writeBakFileRequest /*readBakFileRequest*/];
        this.validReceiveChannels = [
            writeBakFileResponse /*readBakFileResponse*/,
        ];

        // Merge options
        if (typeof options !== "undefined") {
            this.options = Object.assign(this.options, options);
        }

        // ALA electron-store for isolating run in only one process

        // Only run the following code in the renderer
        // process; we can determine if this is the renderer
        // process if we haven't set a new path from our options
        if (
            typeof options === "undefined" ||
            options.path !== defaultOptions.path
        ) {
            // NOTE: This above line is very confusing, but directly sourced from the reference code in secure-electron-store and may be being done purposely due to two instances
            // Needing to be created for the IPC process to function properly. There may be a dependency on the first preload run for the rendering process run.
            //  -- This is checking for what defaultOptions has been updated to on MergeOptions above -- potentially in another instance, not what it IS on first run or defined as above.
            // -- I haven't had the chance to completely dig through that library, but wanted to note this for anyone who may end up here later
            try {
                const arg = process.argv.filter(
                    (p) => p.indexOf("storePath:") >= 0
                )[0];
                this.options.path = arg.substr(arg.indexOf(":") + 1);
            } catch (error) {
                throw new Error(
                    `Could not find property 'additionalArguments' value beginning with 'storePath:' in your BrowserWindow. Please ensure this is set! Error: ${error}`
                );
            }
        }

        const rootPath = this.options.path;
        this.options.path = pathModule.join(
            rootPath,
            `${this.options.filename}${this.options.extension}`
        );
    }

    // Main IPC Bindings
    mainBindings(ipcMain, browserWindow, fs) {
        const { path } = this.options;

        /**
         * Params for anonymous function
         * @param {} IpcMainEvent
         * @param {} args
         */
        ipcMain.on(writeBakFileRequest, () => {
            try {
                // Strip .bak from the path and append it with json to get the file we want to backup
                let currentConfig = fs.readFileSync(
                    path.replace(".json.bak", ".json")
                );
                // Back this file up
                fs.writeFileSync(path, currentConfig);
                console.log("Config backup created at: ", path);
                browserWindow.webContents.send(writeBakFileResponse, {
                    success: true,
                });
            } catch (ex) {
                // If a config doesn't exist, we can just log here for reference
                if (ex.code === "ENOENT") {
                    console.warn(
                        "Config doesn't exist -- skipping backup write."
                    );
                } else {
                    throw new Error(ex);
                }
            }
        });

        // TBD -- May not be needed, or may be used in future features ( Auto restore backup, etc )
        /*
            ipcMain.on(readBakFileRequest, (IpcMainEvent, args) => {
                console.log("READ BAK FILE REQ");
            });
        */
    }

    /**
     * Preload IPC Bindings
     * @param {} ipcRenderer
     * @param {} fs
     */
    preloadBindings(ipcRenderer) {
        return {
            initialValue: this.initialFileValue,
            send: (channel, jsonObj) => {
                if (this.validSendChannels.includes(channel)) {
                    switch (channel) {
                        // Save Data to AliceNetWalletEnc.bak
                        case writeBakFileRequest:
                            ipcRenderer.send(writeBakFileRequest, { jsonObj });
                            break;
                        // Read contents of AliceNetWalletEnc.bak - TBD if needed
                        // case readBakFileRequest: ipcRenderer.send(readBakFileRequest, {}); break;
                    }
                }
            },
            onReceive: (channel, func) => {
                if (this.validReceiveChannels.includes(channel)) {
                    ipcRenderer.on(channel, (event, args) => {
                        // NOTE: Only needed if not using internal logging or need processing on read
                        // switch (channel) {
                        //     case writeBakFileResponse:
                        //         console.log(
                        //             `Write bakFile success: ${args.success}`
                        //         );
                        //         break;
                        //     case readBakFileResp:
                        //         console.log(
                        //             `Read bakFile success: ${args.success}`
                        //         );
                        //         break;
                        // }

                        func(args);
                    });
                }
            },
        };
    }
};
