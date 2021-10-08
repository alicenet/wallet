import React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Header, Segment } from 'semantic-ui-react';
import { ADAPTER_ACTIIONS, ADAPTER_ACTIONS } from 'redux/actions/_actions.js';
import { useDispatch } from 'react-redux';
import { DButton } from '../DebugPanel.jsx';
import { useSelector } from 'react-redux';
import web3Adapter from 'adapters/web3Adapter.js';

export default function Web3Panel() {

    const web3AdapterState = useSelector(s => (s.adapter.web3Adapter));

    const [loading, setLoading] = React.useState(false);

    const initWeb3Adapter = async () => {
        setLoading(true);
        await web3Adapter.__init();
        setLoading(false);
    }

    return (<>
        <Segment>
            <Header as="h4">
                Web3 Overview
                <Header.Subheader>Debug web3 instance initiated: {String(!!web3AdapterState.connected)}</Header.Subheader>
            </Header>
            <div className="flex justify-between items-end">
                <div>
                    <span>
                        <span className="font-bold">connected:</span> {String(web3AdapterState.connected)}
                    </span>
                    <span className="ml-8">
                        <span className="font-bold">error:</span> {String(web3AdapterState.error)}
                    </span>
                    <span className="ml-8">
                        <span className="font-bold">validators:</span> {String(web3AdapterState.validators) + "/" + String(web3AdapterState.max_validators)}
                    </span>
                    <span className="ml-8">
                        <span className="font-bold">epoch:</span> {String(web3AdapterState.epoch)}
                    </span>
                </div>
                <div>
                    <Button.Group size="mini">
                        <DButton color={!web3AdapterState.connected ? "orange" : "purple"} loading={loading}
                            content={!web3AdapterState.connected ? "Init Web3 Adapter" : "Print web3Adapter Instance"}
                            onClick={!web3AdapterState.connected ? initWeb3Adapter : () => console.log(web3Adapter)} />
                    </Button.Group>
                </div>
            </div>
        </Segment>

        <Segment>
            <Header as="h2">Web3 Actions</Header>
        </Segment>

    </>)

}