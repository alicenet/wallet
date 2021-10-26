import React from 'react';
import { Button, Header, Placeholder, Segment } from 'semantic-ui-react';
import { DButton } from '../DebugPanel.jsx';
import { useSelector } from 'react-redux';
import web3Adapter from 'adapters/web3Adapter.js';
import madNetAdapter from 'adapters/madAdapter';
import utils from 'util/_util.js';
import { classNames } from 'util/generic.js';

export default function Web3Panel() {

    const adapterState = useSelector(s => (s.adapter.madNetAdapter));
    const wallets = useSelector(s => s.vault.wallets);
    const [activeWallet, setActiveWallet] = React.useState(false);

    const [loading, setLoading] = React.useState(false);

    const { vaultUnlockedAndExists } = useSelector(s => ({ vaultUnlockedAndExists: s.vault.exists && !s.vault.is_locked }))

    const initMadNetAdapter = async () => {
        setLoading("instance");
        await madNetAdapter.__init();
        setLoading(false);
    }

    const printBalances = async () => {
        setLoading("balances");
        let balancesAndUTXOs = await madNetAdapter.getAllMadWalletBalancesWithUTXOs(); 
        console.log(balancesAndUTXOs);
        setLoading("false");
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
        setLoading("activeAccount");
        setActiveWallet(await web3Adapter.useAccount(wallet.privK));
        setLoading(false);
    };

    return (<>
        <Segment>
            <Header as="h4">
                MadNet Overview
                <Header.Subheader>Debug madNet instance initiated: {String(!!adapterState.connected)}</Header.Subheader>
            </Header>
            <div className="flex justify-between items-end">
                <div>
                    <span>
                        <span className="font-bold">connected:</span> {String(adapterState.connected)}
                    </span>
                    <span className="ml-8">
                        <span onClick={() => console.log(madNetAdapter.failed.get())} className={classNames("font-bold", { "text-red-500": !!adapterState.error })}>error:</span> {String(!!adapterState.error)}
                    </span>
                </div>
                <div>
                    {!vaultUnlockedAndExists && (
                        <div className="text-xs text-red-500 text-center">
                            Unlock accounts first!
                        </div>
                    )}
                    <Button.Group size="mini">
                        <DButton color={!adapterState.connected ? "orange" : "purple"} disabled={!vaultUnlockedAndExists} loading={loading === "instance"}
                            content={!adapterState.connected ? "Init MadNet Adapter" : "Print madNetAdapter Instance"}
                            onClick={!adapterState.connected ? initMadNetAdapter : () => console.log(madNetAdapter)} />
                        <DButton content="Print Wallet Balances"  loading={loading==="balances"} disabled={!adapterState.connected} onClick={printBalances} />
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
                {loading === "activeAccount" ? (
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