import React, { useContext, useState, useEffect, useRef } from 'react';
import { StoreContext } from "../Store/store.js";
import MadNetAdapter from "../Utils/madNetAdapter.js";
import { Button, Menu } from 'semantic-ui-react';

import DataExplorer from './dataExplorer.js';
import BlockExplorer from './blockExplorer.js';
import Transacton from './transaction.js';

function MadNet(props) {
    // Store states
    const { store, actions } = useContext(StoreContext);
    // Sub menu selection
    const [activePanel, setPanel] = useState("transaction");
    // Check if madnet adapter connected
    const connectAttempt = useRef(false);
    // Update madnet adapter
    const update = useRef(false)

    // Add the madNetAdapter and initialize
    const addAdapter = async (forceConnect) => {
        if (!store.madNetAdapter ||
            forceConnect
        ) {
            let madNetAdapter = new MadNetAdapter(adapterCb, store.wallet, store.settings.madnetProvider);
            await madNetAdapter.init()
            await actions.addMadNetAdapter(madNetAdapter)
            update.current = false;
        }
    }

    // Updates for when component mounts or updates
    useEffect(() => {
        // Reset this component to orginal state
        if (props.states.refresh) {
            actions.addMadNetAdapter(false);
            props.states.setRefresh(false);
        }
        // Attempt to setup adapter if not previously instanced
        if (!store.madNetAdapter && !connectAttempt.current) {
            connectAttempt.current = true;
            addAdapter();
        }
        if (store.madNetAdapter &&
            store.settings.madnetProvider !== store.madNetAdapter.provider &&
            !update.current
        ) {
            update.current = true;
            addAdapter(true);
        }
    }, [props, actions, store.madNetAdapter]) // eslint-disable-line react-hooks/exhaustive-deps

    // Callback for the madNetAdapter to update the component
    const adapterCb = async (event, data) => {
        props.states.setUpdateView((updateView) => ++updateView);
        switch (event) {
            case 'success':
                if (data) {
                    props.states.setNotify(data)
                }
                break;;
            case 'wait':
                props.states.setLoading(data);;
                return;;
            case 'error':
                props.states.setError(data);;
                break;;
            case 'notify':
                props.states.setBlockNotify(data);;
                break;;
            default:
                console.log(event)
        }
        props.states.setLoading(false);
    }

    // Render sub menu view
    const view = (activePanel) => {
        switch (activePanel) {
            case 'transaction':
                return (<Transacton />);;
            case 'blockExplorer':
                return (<BlockExplorer states={props.states} />);;
            case 'dataExplorer':
                return (<DataExplorer states={props.states} />);;
            default:
                return (<></>);;
        }
    }

    // Try to reconnect 
    if (!store.madNetAdapter.connected) {
        return (
            <Button onClick={() => addAdapter(true)}>Reconnect</Button>
        )
    }
    else {
        return (
            <>
                <Menu pointing secondary compact>
                    <Menu.Item
                        name="Transaction"
                        active={activePanel === 'transaction'}
                        onClick={() => setPanel("transaction")}
                    />
                    <Menu.Item
                        name="blockExplorer"
                        active={activePanel === 'blockExplorer'}
                        onClick={() => setPanel("blockExplorer")}
                    />
                    <Menu.Item
                        name="DataExplorer"
                        active={activePanel === 'dataExplorer'}
                        onClick={() => setPanel("dataExplorer")}
                    />
                </Menu>
                {view(activePanel)}
            </>
        )
    }
}

export default MadNet;