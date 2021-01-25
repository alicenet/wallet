import React, { createContext, Component } from 'react';

import { writeConfigRequest } from "secure-electron-store";

const defaultSettings = { "madnetChainID": 66, "madnetProvider": "http://127.0.0.1:8888/v1/", "ethereumProvider": "http://127.0.0.1:8545", "registryContract": "0x0", "theme": "dark" }

export const StoreContext = createContext();

// Class component for storing and updating shared states
export class Store extends Component {
    constructor() {
        super();
        this.state = {
            store: {
                wallet: false,
                web3Adapter: false,
                madNetAdapter: false,
                settings: false,
            },
            actions: {
                addWallet: wallet => this.setState({ store: { ...this.state.store, wallet: wallet } }),
                addWeb3Adapter: web3Adapter => this.setState({ store: { ...this.state.store, web3Adapter: web3Adapter } }),
                addMadNetAdapter: madNetAdapter => this.setState({ store: { ...this.state.store, madNetAdapter: madNetAdapter } }),
                loadSettings: () => {
                    let settings = window && window.api && window.api.store && typeof window.api.store.initial()["config"] !== "undefined" ? JSON.parse(window.api.store.initial()["config"]) : defaultSettings
                    this.setState({ store: { ...this.state.store, settings: settings } })
                },
                updateSettings: (settings) => {
                    this.setState({ store: { ...this.state.store, settings: settings } })
                    if(window && window.api && window.api.store) {
                        window.api.store.send(writeConfigRequest, "config", JSON.stringify(settings));
                    }
                    },
                resetSettings: () => {
                    this.setState({ store: { ...this.state.store, settings: defaultSettings } })
                }
            }
        };
    }

    render() {
        return (
            <StoreContext.Provider value={this.state}>
                {this.props.children}
            </StoreContext.Provider>
        );
    }
}