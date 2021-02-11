import React, { useContext } from 'react';
import { StoreContext } from "../../Store/store.js";
import { Container, Button, Form, Icon, Card, Grid, Segment } from 'semantic-ui-react';
import Switch from "react-switch";
import Help from '../help.js';

function Transaction(props) {
    // Store states
    const { store } = useContext(StoreContext);

    // Add a TxOut object to txOuts
    const addTxOuts = (type) => {
        let txOut = {};
        switch (type) {
            case 'VS':
                txOut["type"] = type;;
                txOut["name"] = "Value Store";;
                txOut["fromAddress"] = "";;
                txOut["value"] = "";;
                txOut["toAddress"] = "";;
                txOut["bnCurve"] = false;;
                break;;
            case 'DS':
                txOut["type"] = type;;
                txOut["name"] = "Data Store";;
                txOut["fromAddress"] = "";;
                txOut["index"] = "";;
                txOut["rawData"] = "";;
                txOut["duration"] = "";;
                txOut["bnCurve"] = false;;
                break;;
            default:
                return;;
        }
        store.madNetAdapter.addTxOut(txOut)
    }

    // Remove a single TxOut from txOuts state
    const removeTxOut = (i) => {
        let newData = [...store.madNetAdapter.txOuts];
        newData.splice(i, 1);
        store.madNetAdapter.setTxOuts(newData);
    }

    // Send txOuts state array to adapter to construct TxOut in MadWalletJS
    const handleSubmit = (event) => {
        try {
            event.preventDefault();
            store.madNetAdapter.createTx();
        }
        catch (ex) {
            console.log(ex)
        }
    }

    // Update TxOut objects values with input from user
    const handleChange = (event, i, e, v) => {
        let newData = [...store.madNetAdapter.txOuts];
        if (typeof newData[i] !== "object") { newData[i] = {} }
        if (e === "bnCurve") {
            newData[i][e] = event
            store.madNetAdapter.setTxOuts(newData);
            return
        }
        newData[i][e] = event.target.value
            ?
            event.target.value
            :
            v
                ?
                v.value
                :
                "";
        store.madNetAdapter.setTxOuts(newData);
    }

    // Update TxOut objects values with input from user
    const handleChangeAddress = (event, e, v) => {
        let newData = JSON.parse(JSON.stringify(store.madNetAdapter.changeAddress))
        if (e === "bnCurve") {
            newData[e] = event
            store.madNetAdapter.setChangeAddress(newData);
            return;
        }
        newData[e] = event.target.value
            ?
            event.target.value
            :
            v
                ?
                v.value
                :
                "";
        store.madNetAdapter.setChangeAddress(newData);
    }

    // List available addresses with BN curve
    const availAddr = () => {
        let availableUTXO = [];
        if (!store.wallet) { return [{ "key": 0 }] }
        store.wallet.Account.accounts.map(function (e, i) {
            availableUTXO.push({ "text": "0x" + e["address"].substring(0, 6) + "..." + e["address"].substring(e["address"].length - 6), "value": e["address"], "key": i });
            return true;
        });
        return availableUTXO;
    }

    // Form for creating a TxOut Value Store
    const valueStore = (i) => {
        return (
            <>
                <Form.Field>
                    <label>From Address{<Help type='sender' />}</label>
                    <Form.Select
                        value={store.madNetAdapter.txOuts[i]["fromAddress"]}
                        fluid
                        options={availAddr()}
                        onChange={(event, v) => { handleChange(event, i, "fromAddress", v) }}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Value{<Help type='value' />}</label>
                    <Form.Input value={store.madNetAdapter.txOuts[i]["value"]} onChange={(event) => { handleChange(event, i, "value") }} placeholder="1"></Form.Input>
                </Form.Field>
                <Form.Field>
                    <label>To Address{<Help type='reciever' />}</label>
                    <Form.Input value={store.madNetAdapter.txOuts[i]["toAddress"]} onChange={(event) => { handleChange(event, i, "toAddress") }} placeholder="0x..."></Form.Input>
                </Form.Field>
                <Form.Group className="switch" inline>
                    <label>BN Address{<Help type='bn' />}</label>
                    <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event, data) => { handleChange(event, i, "bnCurve", data) }} checked={Boolean(store.madNetAdapter.txOuts[i]["bnCurve"])} />
                </Form.Group>
            </>
        )
    }

    // Form for creating a TxOut Data Store
    const dataStore = (i) => {
        return (
            <>
                <Form.Field>
                    <label>From Address{<Help type='sender' />}</label>
                    <Form.Select
                        value={store.madNetAdapter.txOuts[i]["fromAddress"]}
                        fluid
                        options={availAddr()}
                        onChange={(event, v) => { handleChange(event, i, "fromAddress", v) }}
                    />
                </Form.Field>
                <Form.Field>
                    <label>Index{<Help type='index' />}</label>
                    <Form.Input value={store.madNetAdapter.txOuts[i]["index"]} onChange={(event) => { handleChange(event, i, "index") }} placeholder="0x OR string" />
                </Form.Field>
                <Form.Field>
                    <label>Data{<Help type='rawData' />}</label>
                    <Form.Input value={store.madNetAdapter.txOuts[i]["rawData"]} onChange={(event) => { handleChange(event, i, "rawData") }} placeholder="0x OR string" />
                </Form.Field>
                <Form.Field>
                    <label>Duration{<Help type='duration' />}</label>
                    <Form.Input value={store.madNetAdapter.txOuts[i]["duration"]} onChange={(event) => { handleChange(event, i, "duration") }} placeholder="1" />
                </Form.Field>
            </>
        )
    }

    // Display for TxOut forms
    const txOutForms = () => {
        if (store.madNetAdapter.txOuts.length < 1) { return (<></>) }
        return store.madNetAdapter.txOuts.map(function (e, i) {
            return (
                <Card key={i}>
                    <Card.Header textAlign="center">
                        <Grid.Row>
                            <Button basic attached="right" size="tiny" floated="right" icon onClick={() => removeTxOut(i)}><Icon corner="top right" color="red" name="close" /></Button>
                        </Grid.Row>
                        <Grid.Row centered textAlign="center">
                            <h3 className="b madCard">{e.name}</h3>
                        </Grid.Row>
                    </Card.Header>
                    <Card.Content>
                        <Form key={i}>
                            {e.type === "DS" ? dataStore(i) : valueStore(i)}
                        </Form>
                    </Card.Content>
                </Card>
            )
        })
    }
    return (
        <Grid stretched centered={true}>
            <Container textAlign="center">
            </Container>
            <Grid.Row centered={true}>
                <Segment raised>
                    <Form key="Tx">
                        <Form.Group widths="equal">
                            <Button color="blue" >
                                <Button.Content onClick={() => addTxOuts("VS")}>Value Store <Icon name="plus" /></Button.Content>
                            </Button>
                            <Button color="blue" >
                                <Button.Content onClick={() => addTxOuts("DS")}>Data Store <Icon name="plus" /></Button.Content>
                            </Button>
                            <Button color="grey" disabled >
                                <Button.Content onClick={() => addTxOuts("AS")}>Atomic Swap <Icon name="plus" /></Button.Content>
                            </Button>
                        </Form.Group>
                        <Form.Field>
                            <label>Change Address{<Help type='changeAddress' />}</label>
                            <Form.Input value={store.madNetAdapter.changeAddress['address']} onChange={(event) => { handleChangeAddress(event, "address") }} placeholder="0x..."></Form.Input>
                        </Form.Field>

                        <Form.Group className="switch" inline>
                            <label>BN Address{<Help type='bn' />}</label>
                            <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event, data) => { handleChangeAddress(event, "bnCurve", data) }} checked={Boolean(store.madNetAdapter.changeAddress["bnCurve"])} />

                        </Form.Group>
                        <Button type='submit' disabled={!Boolean(store.madNetAdapter.txOuts.length > 0)} onClick={(event) => handleSubmit(event)} color="green">Send</Button>
                    </Form>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Container>
                    <Segment raised>
                        <p>{store.madNetAdapter.txOuts.length === 0 ? "No outputs added!" : ""}</p>
                        <Card.Group centered={true}>
                            {txOutForms()}
                        </Card.Group>
                    </Segment>
                </Container>
            </Grid.Row>
        </Grid>
    )
}

export default Transaction;