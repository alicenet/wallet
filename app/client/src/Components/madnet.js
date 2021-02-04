import React, { useContext, useEffect, useRef } from 'react';
import { StoreContext } from "../Store/store.js";
import MadNetAdapter from "../Utils/madNetAdapter.js";
import { Button, Menu } from 'semantic-ui-react';

import DataExplorer from './madnet/dataExplorer.js';
import BlockExplorer from './madnet/blockExplorer.js';
import TxExplorer from './madnet/txExplorer.js';
import Transacton from './madnet/transaction.js';
import BlockModal from './madnet/blockModal.js';


function MadNet(props) {
    // Store states
    const { store, actions } = useContext(StoreContext);
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

    // Unmount
    useEffect(() => {
        return () => { 
            if (store && store.madNetAdapter) {
                props.states.setBlockModal(false) 
            } 
        }
    }, [])

    // Callback for the madNetAdapter to update the component
    const adapterCb = (event, data) => {
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
                props.states.setBlockModal(data);;
                break;;
            case 'view':
                props.states.setMadnetPanel(data);;
                break;;
            default:
                console.log(event)
        }
        props.states.setLoading(false);
    }

    // Render sub menu view
    const view = (activeMadnetPanel) => {
        if (!activeMadnetPanel) {
            activeMadnetPanel = 'transaction'
        }
        switch (activeMadnetPanel) {
            case 'transaction':
                return (<Transacton states={props.states} />);;
            case 'blockExplorer':
                return (<BlockExplorer states={props.states} />);;
            case 'txExplorer':
                return (<TxExplorer states={props.states} />);;
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
                <BlockModal states={props.states} />
                <Menu pointing secondary compact>
                    <Menu.Item
                        name="Transaction"
                        active={props.states.activeMadnetPanel === 'transaction' || !props.states.activeMadnetPanel}
                        onClick={() => props.states.setMadnetPanel("transaction")}
                    />
                    <Menu.Item
                        name="blockExplorer"
                        active={props.states.activeMadnetPanel === 'blockExplorer'}
                        onClick={() => props.states.setMadnetPanel("blockExplorer")}
                    />
                    <Menu.Item
                        name="txExplorer"
                        active={props.states.activeMadnetPanel === 'txExplorer'}
                        onClick={() => props.states.setMadnetPanel("txExplorer")}
                    />
                    <Menu.Item
                        name="DataExplorer"
                        active={props.states.activeMadnetPanel === 'dataExplorer'}
                        onClick={() => props.states.setMadnetPanel("dataExplorer")}
                    />
                </Menu>
                {view(props.states.activeMadnetPanel)}
            </>
        )
    }
}

export default MadNet;