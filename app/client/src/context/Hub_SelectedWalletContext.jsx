import React from 'react';

export const SelectedWalletContext = React.createContext();

/**
 * Provide the ability to select an active wallet within the context via selectedWallet and setSelectedWallet props
 * @param {*} props 
 * @returns - Wrapped component with the respective context provider
 */
export const SelectedWalletProvider = (props) => {

    const [selectedWallet, setSelectedWallet] = React.useState();

    return (
        <SelectedWalletContext.Provider value={{
            selectedWallet: selectedWallet,
            setSelectedWallet: setSelectedWallet,
        }}>
            {props.children}
        </SelectedWalletContext.Provider>
    )

}
