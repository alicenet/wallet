import React from 'react';

const views = {
    electronStore: "electron-store",
    reduxState: "redux-state",
    vaultwallets: "vault-wallets",
}

const defaultContextState = {
    currentView: "electron-store",
}

const DebugContext = React.createContext();

export default function DebugContextProvider({ children }) {

    const [contextState, setContextState] = React.useState(defaultContextState);
    const contextValue = { state: contextState, setState: setContextState };

    return (
        <DebugContext.Provider value={contextValue}>
            {children}
        </DebugContext.Provider>
    )

}

export const GetMockContextSetterByKey = (context, key) => {
    let value = context[key];
    let setter = (val) => context.setState(s => ({ ...s, [key]: val }));
    return [value, setter];
}