import React from 'react';

export const views = {
    REDUX_STATE: "Redux State",
    USER_STORIES: "User Stories",
    ELECTRON_STORE: "Electron Store",
    VAULT_WALLETS: "Vault & Wallets",
    WEB3: "Web3 Provider",
    MADNET: "MadNet Adapter",
}

const defaultContextState = {
    currentView: views.MADNET,
}

export const DebugContext = React.createContext();

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
    let value = context.state[key];
    let setter = (val) => context.setState(s => ({ ...s, [key]: val }));
    return [value, setter];
}