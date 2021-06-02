import React, { useContext, useEffect } from "react";
import { StoreContext } from "./Store/store.js";

import { Dimmer, Loader, Container, Icon, Grid, Menu, Image } from "semantic-ui-react";

import MadNet from "./Components/madnet.js";
import Ethereum from "./Components/ethereum.js";
import Accounts from "./Components/accounts.js";
import Settings from "./Components/settings.js";
import Errors from "./Components/errors.js";
import Notify from "./Components/notify.js"

import Logo from "./Assets/MadNetwork Logo Horizontal GRAYSCALE.png"

const MadWallet = require("madwalletjs");

function MainView(props) {
    // Store component to access states
    const { store, actions } = useContext(StoreContext);

    // Mount setup
    useEffect(() => {
        if (!store.settings || !store.wallet) {
            props.states.setLoading("Loading Wallet")
            if (!store.settings) {
                if (window && window.api && window.api.store) {
                    window.api.store.clearRendererBindings();
                }
                actions.loadSettings();
            }
            if (!store.wallet && store.settings && !props.states.madnetSetup.current) {
                props.states.madnetSetup.current = true;
                let wallet = new MadWallet();
                actions.addWallet(wallet);
            }
            props.states.setStyle(store.settings.theme)
            props.states.themeToggle(store.settings.theme)
        }
        if (store.wallet && store.settings) {
            if (store.wallet.Account && store.wallet.Account.accounts.length === 0) {
                props.states.setLoading(false);
            }
        }
    }, [store.wallet, actions, props.states, props.states.isLoading])

    // Returns a child component based on the menus selected option
    const mainView = (activePanel) => {
        switch (activePanel) {
            case 'accounts':
                return (<Accounts states={props.states} />);;
            case 'madnet':
                return (<MadNet states={props.states} />);;
            case 'ethereum':
                return (<Ethereum states={props.states} />);;
            case 'settings':
                return (<Settings states={props.states} />);;
            default:
                return (<></>);;
        }
    }
    // Loading if app not initialized
    if (!store || !store.wallet || !store.settings) {
        return (
            <>
                <Dimmer page active={Boolean(props.states.isLoading)}>
                    <Loader>{String(props.states.isLoading)}</Loader>
                </Dimmer>
            </>
        )
    }
    // App display
    else {
        return (
            <>
                <Dimmer page active={Boolean(props.states.isLoading)}>
                    <Loader>{String(props.states.isLoading)}</Loader>
                </Dimmer>
                <Errors states={props.states} />
                <Notify states={props.states} />
                <Menu className="warningMenu" size="small" color="yellow" fixed="top">
                    <p>Testnet Version!</p>
                </Menu>
                <Grid centered className="mainView">
                    <Grid.Row className="warningPad">
                        <Menu attached="top" tabular>
                            <Menu.Item>
                                <Image className="logo" src={Logo} size="small" />
                            </Menu.Item>
                            <Menu.Item
                                name="accounts"
                                active={props.states.activePanel === 'accounts'}
                                onClick={() => props.states.setPanel("accounts")}
                            />
                            <Menu.Item
                                name="MadNet"
                                active={props.states.activePanel === 'madnet'}
                                onClick={() => props.states.setPanel("madnet")}
                            />
                            <Menu.Item
                                name="Ethereum"
                                active={props.states.activePanel === 'ethereum'}
                                onClick={() => props.states.setPanel("ethereum")}
                            />
                            <Menu.Item
                                name="Settings"
                                active={props.states.activePanel === 'settings'}
                                onClick={() => props.states.setPanel("settings")}
                            />
                            {/*
                            <Menu.Menu position="right">
                                <Menu.Item>
                                    <Icon onClick={() => props.states.setRefresh(true)} name="refresh" />
                                </Menu.Item>
                            </Menu.Menu>
                            */}
                        </Menu>
                    </Grid.Row>
                    <Grid.Row>
                        <Container>
                            <React.Fragment key={props.states.activePanel}>
                                {mainView(props.states.activePanel)}
                            </React.Fragment>
                        </Container>
                    </Grid.Row>

                </Grid>
            </>
        )
    }
}
export default MainView;