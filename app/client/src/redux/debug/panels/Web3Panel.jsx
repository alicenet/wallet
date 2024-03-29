import React from 'react';
import { Button, Header, Placeholder, Segment } from 'semantic-ui-react';
import { DButton } from '../DebugPanel.jsx';
import { useSelector } from 'react-redux';
import web3Adapter from 'adapters/web3Adapter.js';
import utils from 'util/_util.js';

export default function Web3Panel() {

    const web3AdapterState = useSelector(s => (s.adapter.web3Adapter));
    const wallets = useSelector(s => s.vault.wallets);
    const [activeWallet, setActiveWallet] = React.useState(false);

    const [initLoading, setInitLoading] = React.useState(false);
    const [accountLoading, setAccountLoading] = React.useState(false);

    const initWeb3Adapter = async () => {
        setInitLoading(true);
        await web3Adapter.__init();
        setInitLoading(false);
    }

    const walletArrayToButtons = (walletArray, actionFunction) => {
        return walletArray.map(wallet => {
            let isDisabled = !activeWallet ? false : utils.wallet.compareAddresses(wallet?.address, activeWallet?.address);
            return (
                <DButton disabled={isDisabled} key={wallet.address} content={wallet.name} onClick={() => actionFunction(wallet)} />
            )
        })
    }

    const addWalletToWeb3Instance = async wallet => {
        setAccountLoading(true);
        setActiveWallet(await web3Adapter.useAccount(wallet.privK));
        setAccountLoading(false);
    };

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
                        <DButton color={!web3AdapterState.connected ? "orange" : "purple"} loading={initLoading}
                            content={!web3AdapterState.connected ? "Init Web3 Adapter" : "Print web3Adapter Instance"}
                            onClick={!web3AdapterState.connected ? initWeb3Adapter : () => console.log(web3Adapter)} />
                    </Button.Group>
                </div>
            </div>
        </Segment>

        <Segment>
            <Header as="h5">Select Active Wallet For Web3 Instance</Header>
            <Header as="h6">Internal Wallets Available</Header>
            <Button.Group widths="equal" size="mini">
                {walletArrayToButtons(wallets.internal, addWalletToWeb3Instance)}
            </Button.Group>
            <Header as="h6">External Wallets Available</Header>
            <Button.Group widths="equal" size="mini">
                {walletArrayToButtons(wallets.external, addWalletToWeb3Instance)}
            </Button.Group>
            <Header as="h4">Active Wallet</Header>
            <div className="flex justify-between items-end">
                {accountLoading ? (
                    <Placeholder>Loading Account...</Placeholder>
                ) : activeWallet ? (
                    <div>
                        <span>
                            <span className="font-bold">active:</span> {utils.string.splitStringWithEllipsis(String(activeWallet.address), 4)}
                        </span>
                        <span className="ml-8">
                            <span className="font-bold">ethBal:</span> {String(activeWallet?.balances?.eth)}
                        </span>
                        <span className="ml-8">
                            <span className="font-bold">stakeBal/allowance:</span> {String(activeWallet?.balances?.stakingToken?.balance) + "/" + String(activeWallet?.balances?.stakingToken?.allowance)}
                        </span>
                        <span className="ml-8">
                            <span className="font-bold">utilBal/allowance:</span> {String(activeWallet?.balances?.utilityToken?.balance) + "/" + String(activeWallet?.balances?.utilityToken?.allowance)}
                        </span>
                    </div>
                ) : <Placeholder> Account not loaded yet </Placeholder>}
                <div>
                    <Button.Group size="mini">
                        <DButton content="Print active wallet" onClick={() => console.log(activeWallet)} />
                    </Button.Group>
                </div>
            </div>
        </Segment>

    </>)

}