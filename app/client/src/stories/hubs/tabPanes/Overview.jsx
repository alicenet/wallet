import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ADAPTER_ACTIONS, MODAL_ACTIONS } from 'redux/actions/_actions';

import { Button, Container, Grid } from 'semantic-ui-react'

import { curveTypes } from 'util/wallet';

export default function Overview({ wallet }) {

    const dispatch = useDispatch();
    const balances = useSelector(state => ({ ...state.vault.balances }));
    const vaultExists = useSelector(state => state.vault.exists);
    const { madNetConnected, web3Connected } = useSelector(state => ({ web3Conncted: state.adapter.web3Adapter.connected, madNetConnected: state.adapter.madNetAdapter.connected }));
    const thisWalletBalances = balances[wallet.address] ? balances[wallet.address] : false;
    const [loader, setLoader] = React.useState(false);

    const fetchBalances = React.useCallback(async () => {
        setLoader("balances");
        await dispatch(ADAPTER_ACTIONS.getAndStoreLatestBalancesForAddress(wallet.address))
        setLoader(false);
    }, [wallet])

    // Only fetch balances when connected status changes and is true.
    React.useEffect(() => {
        if ((web3Connected || madNetConnected) && !balances[wallet.address]) {
            fetchBalances();
        }
    }, [web3Connected, madNetConnected, wallet])

    const MicroBalanceLoader = ({ balanceType, balanceKey, balanceAllowance }) => {
        if (loader === "balances") {
            return (<div className="w-23 flex justify-start ">
                <div className="text-left">{balanceType} :</div>
                <div className="ml-2"> . . .</div>
            </div>)
        } else {
            return (<span>
                {balanceType} : {thisWalletBalances[balanceKey]} {balanceAllowance ? " / " + thisWalletBalances[balanceAllowance] : ""}
            </span>)
        }
    }

    const openRenameWalletModal = () => { dispatch(MODAL_ACTIONS.openRenameWalletModal(wallet)) }
    const openRemoveWalletModal = () => { dispatch(MODAL_ACTIONS.openRemoveWalletModal(wallet)) }
    const openXportPrivKModal = () => { dispatch(MODAL_ACTIONS.openXportPrivKModal(wallet)) }

    return (
        <Grid className="break-all text-sm p-3">

            <Grid.Row>

                <Grid.Column width={16}>

                    <Container>

                        <label className="font-semibold">{`Public Address (${wallet.curve === curveTypes.SECP256K1 ? 'Secp256k1' : 'Barreto-Naehrig'} curve)`}</label>
                        <div className="py-1">{`0x${wallet.address}`}</div>

                    </Container>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8}>

                    <Container>

                        <label className="font-semibold">Ethereum Balances</label>
                        <div className="py-1">
                            <div><MicroBalanceLoader balanceType="ETH" balanceKey={"eth"} /></div>
                            <div><MicroBalanceLoader balanceType="STAKE" balanceKey={"stake"} balanceKey2={"stakeAllowance"} /></div>
                            <div><MicroBalanceLoader balanceType="UTIL" balanceKey={"util"} balanceKey2={"utilAllowance"} /></div>
                        </div>

                    </Container>

                </Grid.Column>

                <Grid.Column width={8}>

                    <Container>

                        <label className="font-semibold">MadNet Balances</label>
                        <div className="py-1">
                            <div><MicroBalanceLoader balanceType="MadBytes" balanceKey={"madBytes"} /></div>
                        </div>

                    </Container>

                </Grid.Column>

            </Grid.Row>

            <Grid.Row>

                <Grid.Column width={8}>

                    <Container>

                        <label className="font-semibold">Origin</label>
                        <div className="py-1">{wallet.isInternal ? 'Internal (From Seed)' : 'External'}</div>

                    </Container>

                </Grid.Column>

                <Grid.Column width={8}>

                    <Container>

                        <label className="font-semibold">Actions</label>
                        <Container className="flex flex-col items-baseline underline py-1">
                            <Button className="text-green-500 text-sm bg-transparent p-0.5" onClick={fetchBalances}>Refresh Balances</Button>
                            {vaultExists && (
                                <Button className="text-purple-700 text-sm bg-transparent p-0.5" onClick={openRenameWalletModal} >Rename Wallet</Button>
                            )} {/* Currently Vault Only */ } 
                            <Button className="text-purple-700 text-sm bg-transparent p-0.5" onClick={openRemoveWalletModal} >Export Private Key</Button>
                            <Button className="text-red-700 text-sm bg-transparent p-0.5" onClick={openXportPrivKModal} >Remove Wallet</Button>
                        </Container>

                    </Container>

                </Grid.Column>

            </Grid.Row>

        </Grid>
    )

}

