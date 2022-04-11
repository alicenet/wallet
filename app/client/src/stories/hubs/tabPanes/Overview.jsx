import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Container, Grid, Icon } from 'semantic-ui-react'
import utils, { walletUtils } from 'util/_util';

import { ADAPTER_ACTIONS, MODAL_ACTIONS } from 'redux/actions/_actions';
import { curveTypes } from 'util/wallet';
import { classNames } from 'util/generic';

export default function Overview({ wallet }) {

    const dispatch = useDispatch();
    const [copyClick, setCopyClick] = React.useState(0);

    const { madNetConnected, web3Connected, vaultExists, balances, balancesLoading } = useSelector(state => (
        {
            web3Connected: state.adapter.web3Adapter.connected,
            madNetConnected: state.adapter.madNetAdapter.connected,
            vaultExists: state.vault.exists,
            balances: state.vault.balances,
            balancesLoading: state.vault.balancesLoading
        }));

    const thisWalletBalances = balances[wallet.address] ? balances[wallet.address] : false;
    const fetchBalances = useCallback(async () => {
        await dispatch(ADAPTER_ACTIONS.getAndStoreLatestBalancesForAddress(wallet.address))
    }, [wallet, dispatch]);

    // Only fetch balances when connected status changes and is true.
    useEffect(() => {
        if ((web3Connected || madNetConnected) && !balances[wallet.address] && !balancesLoading) {
            fetchBalances();
        }
    }, [web3Connected, madNetConnected, wallet, fetchBalances, balances, balancesLoading]);

    const MicroBalanceLoader = ({ balanceType, balanceKey, balanceAllowance }) => {

        return (
            <div className="text-xs">
                <div className="text-right w-24 inline font-bold">{balanceType}:</div>
                <div className="ml-2 text-left inline text-gray-500">
                    {balancesLoading ? <div className="ellipses-after inline" /> :
                        thisWalletBalances[balanceKey] ? (thisWalletBalances[balanceKey]) : ""}
                    {balanceAllowance && !balancesLoading && thisWalletBalances[balanceAllowance] ? " / " + (thisWalletBalances[balanceAllowance]) : ""}
                </div>
            </div>
        )
    };

    const openRenameWalletModal = () => { dispatch(MODAL_ACTIONS.openRenameWalletModal(wallet)) };

    const openXportPrivKModal = () => { dispatch(MODAL_ACTIONS.openXportPrivKModal(wallet)) };

    const openXportKeystoreModal = () => { dispatch(MODAL_ACTIONS.openXportKeyStoreModal(wallet)) };

    const openRemoveWalletModal = () => { dispatch(MODAL_ACTIONS.openRemoveWalletModal(wallet)) };

    const copyAddress = () => {
        setCopyClick(true);
        utils.generic.copyToClipboard(wallet.address);
        setTimeout(() => {
            setCopyClick(false);
        }, 2150)
    };

    return (
        <Grid
            className="segment flex flex-col justify-start bg-white break-all text-sm m-0 p-4 text-gray-700 border-solid border border-gray-300 border-t-0 rounded-tl-none rounded-tr-none h-81">

            <Grid.Row>

                <Grid.Column width={16} className="pl-1">

                    <label className="text-gray-800">
                        <span className="font-semibold underline">{`${wallet.name} Public Address`}</span>
                        {` (${wallet.curve === curveTypes.SECP256K1 ? 'Secp256k1' : 'Barreto-Naehrig'} curve)`}
                    </label>
                    <div className="h-10 py-1 flex items-center cursor-pointer hover:text-gray-500" onClick={copyAddress}>
                        {utils.string.addCurvePrefix(wallet.address, wallet.curve)}
                        <Icon name="copy outline" className="ml-1 mb-2 cursor-pointer" />
                        {!!copyClick && (
                            <div className="relative inline text-xs mb-2 text-gray-500">
                                Copied to clipboard!
                            </div>
                        )}
                    </div>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8} className="pl-1">

                    <Container>

                        <label className={classNames("font-semibold text-gray-800 underline", { "line-through": wallet.curve === walletUtils.curveTypes.BARRETO_NAEHRIG })}>Ethereum
                            Balances</label>
                        <div className="py-1 flex flex-col">
                            {wallet.curve === walletUtils.curveTypes.BARRETO_NAEHRIG ? (
                                <div>
                                    Not available to BN Wallets
                                </div>
                            ) : (<>
                                <MicroBalanceLoader balanceType="ETH" balanceKey={"eth"} />
                                <MicroBalanceLoader balanceType="STAKE" balanceKey={"stake"} balanceAllowance={"stakeAllowance"} />
                                <MicroBalanceLoader balanceType="UTIL" balanceKey={"util"} balanceAllowance={"utilAllowance"} />
                            </>)}
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
                        <Container className="flex flex-col items-baseline py-1 gap-1">
                            <Button className="transparent p-0 text-teal text-sm hover:underline" onClick={fetchBalances}>Refresh Balances</Button>
                            {vaultExists && (
                                <Button className="transparent p-0 text-teal text-sm hover:underline" onClick={openRenameWalletModal}>Rename Wallet</Button>
                            )}
                            <Button className="transparent p-0 text-teal text-sm hover:underline" onClick={openXportPrivKModal}>Show Private Key</Button>
                            <Button className="transparent p-0 text-teal text-sm hover:underline" onClick={openXportKeystoreModal}>Export Keystore</Button>
                            <Button className="transparent p-0 text-red-600 text-sm hover:underline" onClick={openRemoveWalletModal}>Remove Wallet</Button>
                        </Container>

                    </Container>

                </Grid.Column>

            </Grid.Row>

        </Grid>
    )

}