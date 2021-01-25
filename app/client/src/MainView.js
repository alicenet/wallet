import React, { useContext, useState, useEffect, useRef } from "react";
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

function MainView() {
    // Store component to access states
    const { store, actions } = useContext(StoreContext);
    // Add child component to the view
    const [activePanel, setPanel] = useState("accounts");
    // Theme style
    const [style, setStyle] = useState("dark");

    /**
 * Props for childern components to update main view
 * Refresh, Loading, Errors, Update View
 */
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [isError, setError] = useState(false);
    const [isNotify, setNotify] = useState({});
    const [updateView, setUpdateView] = useState(0);
    const madnetSetup = useRef(false);

    useEffect(() => {
        if (!store.settings || !store.wallet) {
            setLoading("Loading Wallet")
            if (!store.settings) {
                if (window && window.api && window.api.store) {
                    window.api.store.clearRendererBindings();
                }
                actions.loadSettings();
            }
            if (!store.wallet && store.settings && !madnetSetup.current) {
                madnetSetup.current = true;
                let wallet = new MadWallet()
                actions.addWallet(wallet);
            }
        }
        if (store.wallet && store.settings) {
            setStyle(store.settings.theme)
            themeToggle(store.settings.theme)
            setLoading(false);
        }
    }, [store, actions, setStyle])

    // Toggle "dark" & "light" themes
    const themeToggle = (theme) => {
        if (theme === "dark") {
            window.setDark()
            setStyle(theme)
            return;
        }
        window.setLight()
        setStyle(theme)
    }

    // Object for the props to be used in childern components
    const propStates = {
        refresh: refresh,
        setRefresh: setRefresh,
        isLoading: isLoading,
        setLoading: setLoading,
        isError: isError,
        setError: setError,
        setNotify: setNotify,
        isNotify: isNotify,
        updateView: updateView,
        setUpdateView: setUpdateView,
        themeToggle: themeToggle,
        style: style,
    }

    // Returns a child component based on the menus selected option
    const mainView = (activePanel) => {
        switch (activePanel) {
            case 'accounts':
                return (<Accounts states={propStates} />);;
            case 'madnet':
                return (<MadNet states={propStates} />);;
            case 'ethereum':
                return (<Ethereum states={propStates} />);;
            case 'settings':
                return (<Settings states={propStates} />);;
            default:
                return (<></>);;
        }
    }
    // Loading if app not initialized
    if (!store || !store.wallet || !store.settings) {
        return (
            <>
                <Dimmer page active={Boolean(isLoading)}>
                    <Loader>{String(isLoading)}</Loader>
                </Dimmer>
            </>
        )
    }
    // App display
    else {
        return (
            <>
                <Dimmer page active={Boolean(isLoading)}>
                    <Loader>{String(isLoading)}</Loader>
                </Dimmer>
                <Errors states={propStates} />
                <Notify states={propStates} />
                <Menu className="warningMenu" size="small" color="yellow" fixed="top">
                    <p>Alpha version software for testing only!</p>
                </Menu>
                <Grid centered className="mainView">
                    <Grid.Row className="warningPad">
                        <Menu attached="top" tabular>
                            <Menu.Item>
                                <Image className="logo" src={Logo} size="small" />
                            </Menu.Item>
                            <Menu.Item
                                name="accounts"
                                active={activePanel === 'accounts'}
                                onClick={() => setPanel("accounts")}
                            />
                            <Menu.Item
                                name="MadNet"
                                active={activePanel === 'madnet'}
                                onClick={() => setPanel("madnet")}
                            />
                            <Menu.Item
                                name="Ethereum"
                                active={activePanel === 'ethereum'}
                                onClick={() => setPanel("ethereum")}
                            />
                            <Menu.Item
                                name="Settings"
                                active={activePanel === 'settings'}
                                onClick={() => setPanel("settings")}
                            />
                            <Menu.Menu position="right">
                                <Menu.Item>
                                    <Icon onClick={() => setRefresh(true)} name="refresh" />
                                </Menu.Item>
                            </Menu.Menu>
                        </Menu>
                    </Grid.Row>
                    <Grid.Row>
                        <Container>
                            <React.Fragment key={activePanel}>
                                {mainView(activePanel)}
                            </React.Fragment>
                        </Container>
                    </Grid.Row>

                </Grid>
            </>
        )
    }
}
export default MainView;