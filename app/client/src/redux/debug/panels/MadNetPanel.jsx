import React from 'react';
import { Button, Form, Grid, Header, Segment } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import madNetAdapter from 'adapters/madAdapter';
import { useValueStoreFormState } from 'hooks/_hooks';

const FormInput = ({ ...props }) => (<Form.Input size="mini"  {...props} />)

export default function Web3Panel() {

    const adapterState = useSelector(s => (s.adapter.madNetAdapter));

    const [loading, setLoading] = React.useState(false); //eslint-disable-line

    const [valueFormState, valueFormSetters, valueFormErrors, onValueSubmit] = useValueStoreFormState((state) => {
        console.log(state); // For Debug
    });

    const initMadNetAdapter = async () => {
        setLoading("instance");
        await madNetAdapter.__init();
        setLoading(false);
    }

    const printBalances = async () => {
        setLoading("balances");
        let balancesAndUTXOs = await madNetAdapter.getAllMadWalletBalancesWithUTXOs();
        console.log(balancesAndUTXOs); // For debug
        setLoading("false");
    }

    const addValueStore = () => {
        let txObject = {}
        txObject["type"] = "VS";
        txObject["name"] = "Value Store";
        txObject["fromAddress"] = "";
        txObject["value"] = "";
        txObject["toAddress"] = "";
        txObject["bnCurve"] = false;
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
                                label="From" size='mini' value={valueFormState.fromAddress} onChange={e => valueFormSetters.setFromAddress(e.target.value)} />
                            <Form.Group widths="equal">
                                <Form.Button size="mini" fluid content="Use Wallet 1" />
                                <Form.Button size="mini" fluid content="Use Wallet 2" />
                            </Form.Group>

                            <FormInput error={!!valueFormErrors.toAddress && { content: valueFormErrors.toAddress }}
                                label="To" size='mini' value={valueFormState.toAddress} onChange={e => valueFormSetters.setFromAddress(e.target.value)} />
                            <Form.Group widths="equal">
                                <Form.Button size="mini" fluid content="Use Wallet 1" />
                                <Form.Button size="mini" fluid content="Use Wallet 2" />
                            </Form.Group>

                            <FormInput error={!!valueFormErrors.value && { content: valueFormErrors.value }}
                                label="Value" size='mini' value={valueFormState.value} onChange={e => valueFormSetters.setValue(e.target.value)} />
                            <Form.Checkbox className="small-checkbox" label="Is BN Address" checked={valueFormState.isBn} onChange={e => valueFormSetters.setIsBn(!valueFormState.isBn)} />
                            <Form.Button content="Add TXO" size="mini" className="mt-4" onClick={onValueSubmit} />
                        </Form>
                    </Segment>
                </Grid.Column>

                <Grid.Column>
                    <Segment>
                        <Header sub>Add Data TXo</Header>
                    </Segment>
                </Grid.Column>

            </Grid>

        </Segment>

    </>)

}