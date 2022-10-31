require("dotenv").config();

import { notarize } from "electron-notarize";

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== "darwin") {
        return;
    }

    const appName = context.packager.appInfo.productFilename;
    const email = process.env.APPLE_EMAIL;
    const password = process.env.APPLE_PASSWORD;

    return await notarize({
        appBundleId: "com.MadHive.AliceNetWallet",
        appPath: `${appOutDir}/${appName}.app`,
        appleId: email,
        appleIdPassword: password,
    });
};
