import React from 'react';
import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import madNetAdapter from 'adapters/madAdapter';
import { useValueStoreFormState } from 'hooks/_hooks';
import { walletUtils } from 'util/_util';

const FormInput = ({ ...props }) => (<Form.Input size="mini"  {...props} />)

export default function Web3Panel() {

    const { wallets, adapterState } = useSelector(s => ({
        wallets: [...s.vault.wallets.internal, ...s.vault.wallets.external],
        adapterState: s.adapter.madNetAdapter,
    }))

    const [loading, setLoading] = React.useState(false); //eslint-disable-line

    const [valueFormState, valueFormSetters, valueFormErrors, onValueSubmit] = useValueStoreFormState();

    const addValueStore = (state) => {
        console.log("HIT!")
        let txObject = {}
        txObject["type"] = "VS";
        txObject["name"] = "Value Store";
        txObject["fromAddress"] = state.fromAddress;
        txObject["value"] = state.value;
        txObject["toAddress"] = state.toAddress;
        txObject["bnCurve"] = false;

        let test = madNetAdapter.addTxOut(txObject);
        console.log(test);
    }

    const sendTx = async () => {
        let result = await madNetAdapter.createTx()
        console.log(result)
    }

    const getWalletButtons = (cb = () => { }) => {
        return wallets.map((wallet, idx) => {
            return (
                <Form.Button size="mini" fluid content={"w" + (idx + 1)} onClick={() => cb(wallet)} />
            )
        })
    }

    const useFromWallet = (wallet) => {
        valueFormSetters.setFromAddress(wallet.address);
    }

    const useToWallet = (wallet) => {
        valueFormSetters.setToAddress(wallet.address);
    }

    return (<>
        <Segment>
            <Header as="h4">
                MadNet Overview
                <Header.Subheader>Debug madNet instance initiated: {String(!!adapterState.connected)}</Header.Subheader>
            </Header>
        </Segment>

        <Segment>

            <Header>Transaction Panel</Header>

            <Segment>
                <Button content="Print MadWalletInstance" size='mini' onClick={() => console.log(madNetAdapter.getMadNetWalletInstance())} />
                <Button content="Print TXout List" size='mini' onClick={() => console.log(madNetAdapter.txOuts.get())} className="ml-4" />
            </Segment>

            <Grid columns={2}>

                <Grid.Column>
                    <Segment>
                        <Header className="text-sm text-blue-500">Add Value TXo</Header>
                        <Form size="mini" className="mini-error-form">

                            <FormInput error={!!valueFormErrors.fromAddress && { content: valueFormErrors.fromAddress }}
                                label={"From " + walletUtils.getWalletNameFromAddress(valueFormState.fromAddress)}
                                size='mini' value={valueFormState.fromAddress} onChange={e => valueFormSetters.setFromAddress(e.target.value)} />
                            <Form.Group widths="equal">
                                {getWalletButtons(useFromWallet)}
                            </Form.Group>

                            <FormInput error={!!valueFormErrors.toAddress && { content: valueFormErrors.toAddress }}
                                label={"To: " + walletUtils.getWalletNameFromAddress(valueFormState.toAddress)}
                                size='mini' value={valueFormState.toAddress} onChange={e => valueFormSetters.setFromAddress(e.target.value)} />
                            <Form.Group widths="equal">
                                {getWalletButtons(useToWallet)}
                            </Form.Group>

                            <FormInput error={!!valueFormErrors.value && { content: valueFormErrors.value }}
                                label="Value" size='mini' value={valueFormState.value} onChange={e => valueFormSetters.setValue(e.target.value)} />
                            <Form.Checkbox className="small-checkbox" label="Is BN Address" checked={valueFormState.isBn} onChange={e => valueFormSetters.setIsBn(!valueFormState.isBn)} />

                            <div className="flex justify-between">
                                <Form.Button content="Add TXO" size="mini" className="mt-4" onClick={() => onValueSubmit(addValueStore)} />
                                <Form.Button content="Print TXO List" size="mini" className="mt-4" onClick={() => console.log(madNetAdapter.txOuts.get())} />
                            </div>
                        </Form>
                    </Segment>
                </Grid.Column>

                <Grid.Column>
                    <Segment>
                        <Header sub>Add Data TXo</Header>
                        <Button content="Send" onClick={sendTx}/>
                    </Segment>
                </Grid.Column>

            </Grid>

        </Segment>

    </>)

}