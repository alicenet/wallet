require("dotenv").config();

import { app, BrowserWindow, ipcMain, shell } from "electron";

const isDev = require("electron-is-dev");

const Store = require("secure-electron-store").default;
const fs = require("fs");

const path = require("path");
const url = require("url");
const BackupStore = require("./BackupStore");

const port = "3000";
const selfHost = `http://localhost:${port}`;
const allowedRoots = ["https://testnet.mnexplore.com"];
const icon = path.join(__dirname, "/app-build/electron/icon.png");

let win;

async function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "",
        icon,
        autoHideMenuBar: true,
        webPreferences: {
            devTools: isDev,
            nodeIntegration: false,
            nodeIntegrationInWorker: false,
            nodeIntegrationInSubFrames: false,
            contextIsolation: true,
            worldSafeExecuteJavaScript: true,
            webSecurity: true,
            enableRemoteModule: false,
            additionalArguments: [`storePath:${app.getPath("userData")}`],
            preload: path.join(__dirname, "./preload.js"),
        },
    });

    const store = new Store({
        path: app.getPath("userData"),
        unprotectedPath: app.getPath("userData"),
        filename: "AliceNetWalletUser",
    });

    const storeBak = new BackupStore({
        path: app.getPath("userData"),
        filename: "AliceNetWalletUser",
        extension: ".json.bak",
    });

    store.mainBindings(ipcMain, win, fs);
    storeBak.mainBindings(ipcMain, win, fs);

    if (isDev) {
        win.loadURL(selfHost);
    } else {
        win.loadURL(
            url.format({
                pathname: path.join(__dirname, "../index.html"),
                protocol: "file:",
                slashes: true,
            })
        );
    }
}

app.on("ready", () => {
    createWindow();
});

app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

// https://electronjs.org/docs/tutorial/security#12-disable-or-limit-navigation
app.on("web-contents-created", (event, contents) => {
    // Will open URLs from window.open(), a link with target="_blank", shift+clicking on a link,
    // or submitting a form with <form target="_blank">
    contents.setWindowOpenHandler(({ url: navigationUrl }) => {
        const parsedUrl = new URL(navigationUrl);

        if (allowedRoots.includes(parsedUrl.origin)) {
            shell.openExternal(navigationUrl);
        }

        return { action: "deny" };
    });

    contents.on("will-navigate", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        const validOrigins = [selfHost];

        // Log and prevent the app from navigating to a new page if that page's origin is not whitelisted
        if (!validOrigins.includes(parsedUrl.origin)) {
            console.error(
                `The application tried to redirect to the following address: '${parsedUrl}'. This origin is not whitelisted and the attempt to navigate was blocked.`
            );

            event.preventDefault();
        }
    });

    contents.on("will-redirect", (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        const validOrigins = [];

        // Log and prevent the app from redirecting to a new page
        if (!validOrigins.includes(parsedUrl.origin)) {
            console.error(
                `The application tried to redirect to the following address: '${navigationUrl}'. This attempt was blocked.`
            );

            event.preventDefault();
        }
    });

    // https://electronjs.org/docs/tutorial/security#11-verify-webview-options-before-creation
    contents.on("will-attach-webview", (event, webPreferences) => {
        // Strip away preload scripts if unused or verify their location is legitimate
        delete webPreferences.preload;
        delete webPreferences.preloadURL;

        // Disable Node.js integration
        webPreferences.nodeIntegration = false;
    });

    // https://electronjs.org/docs/tutorial/security#13-disable-or-limit-creation-of-new-windows
    contents.on("new-window", async (event, navigationUrl) => {
        // Log and prevent opening up a new window
        console.error(
            `The application tried to open a new window at the following address: '${navigationUrl}'. This attempt was blocked.`
        );

        event.preventDefault();
    });
});

app.on("remote-require", (event) => {
    event.preventDefault();
});

// built-ins are modules such as "app"
app.on("remote-get-builtin", (event) => {
    event.preventDefault();
});

app.on("remote-get-global", (event) => {
    event.preventDefault();
});

app.on("remote-get-current-window", (event) => {
    event.preventDefault();
});

app.on("remote-get-current-web-contents", (event) => {
    event.preventDefault();
});

app.on("window-all-closed", () => {
    // if (process.platform !== "darwin") {
    // store.clearMainBindings(ipcMain);
    app.quit();
    // }
});

app.on("quit", () => {
    app.exit(0);
});

// Not used in new chrome
if (isDev) {
    app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");
}
