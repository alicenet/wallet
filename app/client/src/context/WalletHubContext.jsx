import React, { createContext, useState } from "react";

export const WalletHubContext = createContext(null);

/**
 * Provides the ability to: select an active wallet, select an active tab pane
 * @param {*} props
 * @returns - Wrapped component with the respective context provider
 */
export const WalletHubProvider = (props) => {
    const [selectedWallet, setSelectedWallet] = useState(null);
    const [activeTabPane, setActiveTabPane] = useState(0);

    return (
        <WalletHubContext.Provider
            value={{
                selectedWallet,
                setSelectedWallet,
                activeTabPane,
                setActiveTabPane,
            }}
        >
            {props.children}
        </WalletHubContext.Provider>
    );
};
