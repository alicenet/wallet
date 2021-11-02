import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ADAPTER_ACTIONS, MODAL_ACTIONS } from 'redux/actions/_actions';
import copy from 'copy-to-clipboard';

import { Button, Container, Grid, Icon } from 'semantic-ui-react'

import { curveTypes } from 'util/wallet';

export default function Overview({ wallet }) {

    const dispatch = useDispatch();
    const balances = useSelector(state => ({ ...state.vault.balances }));
    const vaultExists = useSelector(state => state.vault.exists);
    const { madNetConnected, web3Connected } = useSelector(state => ({ web3Conncted: state.adapter.web3Adapter.connected, madNetConnected: state.adapter.madNetAdapter.connected }));
    const thisWalletBalances = balances[wallet.address] ? balances[wallet.address] : false;
    const [loader, setLoader] = React.useState("");

    const [copyClick, setCopyClick] = React.useState(0);
    const fetchBalances = React.useCallback(async () => {
        setLoader("balances");
        await dispatch(ADAPTER_ACTIONS.getAndStoreLatestBalancesForAddress(wallet.address))
        setLoader(false);
    }, [wallet, dispatch])

    // Only fetch balances when connected status changes and is true.
    React.useEffect(() => {
        if ((web3Connected || madNetConnected) && !balances[wallet.address] && loader !== "balances") {
            fetchBalances();
        }
    }, [web3Connected, madNetConnected, wallet, fetchBalances, balances, loader])

    const MicroBalanceLoader = ({ balanceType, balanceKey, balanceAllowance }) => {

        return (
            <div className="text-xs">
                <div className="text-right w-24 inline font-bold">{balanceType}:</div>
                <div className="ml-2 text-left inline text-gray-500">
                    {loader === "balances" ? ". . ." :
                        thisWalletBalances[balanceKey] ? (thisWalletBalances[balanceKey]) : ""}
                        {balanceAllowance ? " / " + (thisWalletBalances[balanceAllowance]) : ""}
                </div>
            </div>
        )
    }

    const openRenameWalletModal = () => { dispatch(MODAL_ACTIONS.openRenameWalletModal(wallet)) }
    // const openRemoveWalletModal = () => { dispatch(MODAL_ACTIONS.openRemoveWalletModal(wallet)) }
    const openXportPrivKModal = () => { dispatch(MODAL_ACTIONS.openXportPrivKModal(wallet)) }

    const copyAddress = () => {
        setCopyClick(true);
        copy(wallet.address);
        setTimeout(() => {
            setCopyClick(false);
        }, 2150)
    }

    return (
        <Grid className="break-all text-sm p-3 text-gray-700">

            <Grid.Row>

                <Grid.Column width={16} className="pl-1">

                    <Container>

                        <label className="font-semibold text-gray-800 underline">{`Public Address (${wallet.curve === curveTypes.SECP256K1 ? 'Secp256k1' : 'Barreto-Naehrig'} curve)`}</label>
                        <div className="h-10 py-1 flex items-center cursor-pointer hover:text-gray-500" onClick={copyAddress}>
                            {`0x${wallet.address}`}
                            <Icon name="copy outline" className="ml-1 mb-2 cursor-pointer" />
                            {!!copyClick && (
                                <div className="relative inline text-xs mb-2 text-gray-500">
                                    Copied to clipboard!
                                </div>
                            )}
                        </div>

                    </Container>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8} className="pl-1">

                    <Container>

                        <label className="font-semibold text-gray-800 underline">Ethereum Balances</label>
                        <div className="py-1 flex flex-col">
                            <MicroBalanceLoader balanceType="ETH" balanceKey={"eth"} />
                            <MicroBalanceLoader balanceType="STAKE" balanceKey={"stake"} balanceAllowance={"stakeAllowance"} />
                            <MicroBalanceLoader balanceType="UTIL" balanceKey={"util"} balanceAllowance={"utilAllowance"} />
                        </div>

                    </Container>

                </Grid.Column>

                <Grid.Column width={8} className="pl-1">

                    <Container>

                        <label className="font-semibold text-gray-800 underline">MadNet Balances</label>
                        <div className="py-1">
                            <MicroBalanceLoader balanceType="MadBytes" balanceKey={"madBytes"} />
                        </div>

                    </Container>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8} className="pl-1">

                    <Container>

                        <label className="font-semibold text-gray-800 underline">Origin</label>
                        <div className="py-1 text-gray-500">{wallet.isInternal ? 'Internal (From Seed)' : 'External'}</div>

                    </Container>

                </Grid.Column>

                <Grid.Column width={8} className="pl-1">

                    <Container>

                        <label className="font-semibold text-gray-800 underline">Wallet Actions</label>
                        <Container className="flex flex-col items-baseline text-deco py-1 gap-1">
                            <Button className="text-green-500 text-sm bg-transparent p-0.5 pl-0 hover:underline" onClick={fetchBalances}>Refresh Balances</Button>
                            {vaultExists && (
                                <Button className="text-purple-700 text-sm bg-transparent p-0.5 pl-0 hover:underline" onClick={openRenameWalletModal} >Rename Wallet</Button>
                            )} {/* Currently Vault Only */}
                            <Button className="text-purple-700 text-sm bg-transparent p-0.5 pl-0 hover:underline" onClick={openXportPrivKModal}>Export Private Key</Button>
                            {/** -- Placeholder for feature addition 
                            {!wallet.isInternal && (
                                <Button className="text-red-700 text-sm bg-transparent p-0.5" onClick={openRemoveWalletModal}>Remove Wallet</Button>
                            )}
                            */}
                        </Container>

                    </Container>

                </Grid.Column>

            </Grid.Row>

        </Grid>
    )

}

