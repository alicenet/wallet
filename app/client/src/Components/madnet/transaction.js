import React, { useContext, useState} from 'react';
import { StoreContext } from "../../Store/store.js";
import { Container, Button, Form, Icon, Card, Grid, Segment } from 'semantic-ui-react';
import Switch from "react-switch";

function Transaction(props) {
    // Store states
    const { store } = useContext(StoreContext);
    // TxOut data
    const [txOuts, updateTxOut] = useState([]);
    // Change address for TxOuts
    const [changeAddress, updateChangeAddress] = useState({ "address": "", "bnCurve": false })

    // Add a TxOut object to txOuts
    const addTxOuts = (type) => {
        let txOut = {};
        switch (type) {
            case 'VS':
                txOut["type"] = type;;
                txOut["name"] = "Value Store";;
                break;;
            case 'DS':
                txOut["type"] = type;;
                txOut["name"] = "Data Store";;
                break;;
            default:
                return;;
        }
        updateTxOut([
            ...txOuts,
            txOut
        ])
    }

    // Remove a single TxOut from txOuts state
    const removeTxOut = (i) => {
        let newData = [...txOuts];
        newData.splice(i, 1);
        updateTxOut(newData);
    }

    // Send txOuts state array to adapter to construct TxOut in MadWalletJS
    const handleSubmit = (event) => {
        try {
            event.preventDefault();
            store.madNetAdapter.createTx(txOuts, changeAddress);
            updateTxOut([]);
            updateChangeAddress({ "address": "", "bnCurve": false });
        }
        catch (ex) {
            console.log(ex)
        }
    }

    // Update TxOut objects values with input from user
    const handleChange = (event, i, e, v) => {
        let newData = [...txOuts];
        if (typeof newData[i] !== "object") { newData[i] = {} }
        if (e === "bnCurve") {
            newData[i][e] = event
            updateTxOut(newData);
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
        updateTxOut(newData);
    }

    // Update TxOut objects values with input from user
    const handleChangeAddress = (event, e, v) => {
        let newData = JSON.parse(JSON.stringify(changeAddress))
        if (e === "bnCurve") {
            newData[e] = event
            updateChangeAddress(newData);
            return
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
        updateChangeAddress(newData);
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
                <Form.Select
                    fluid
                    label='From Address'
                    options={availAddr()}
                    onChange={(event, v) => { handleChange(event, i, "fromAddress", v) }}
                />
                <Form.Input onChange={(event) => { handleChange(event, i, "value") }} label="Value" placeholder="1"></Form.Input>
                <Form.Input onChange={(event) => { handleChange(event, i, "toAddress") }} label="To Address" placeholder="0x..."></Form.Input>
                <Form.Group className="switch" inline>
                    <label>BN Address</label>
                    <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event, data) => { handleChange(event, i, "bnCurve", data) }} checked={Boolean(txOuts[i]["bnCurve"])} />
                </Form.Group>
            </>
        )
    }

    // Form for creating a TxOut Data Store
    const dataStore = (i) => {
        return (
            <>
                <Form.Select
                    fluid
                    label='From Address'
                    options={availAddr()}
                    onChange={(event, v) => { handleChange(event, i, "fromAddress", v) }}
                />
                <Form.Input onChange={(event) => { handleChange(event, i, "index") }} label="Index" placeholder="0x OR string"></Form.Input>
                <Form.Input onChange={(event) => { handleChange(event, i, "rawData") }} label="Data" placeholder="0x OR string"></Form.Input>
                <Form.Input onChange={(event) => { handleChange(event, i, "duration") }} label="Duration" placeholder="1"></Form.Input>
            </>
        )
    }

    // Display for TxOut forms
    const txOutForms = () => {
        if (txOuts.length < 1) { return (<></>) }
        return txOuts.map(function (e, i) {
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
                        <Form.Input onChange={(event) => { handleChangeAddress(event, "address") }} label="Change Address" placeholder="0x..."></Form.Input>
                        <Form.Group className="switch" inline>
                            <label>BN Address</label>
                            <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event, data) => { handleChangeAddress(event, "bnCurve", data) }} checked={Boolean(changeAddress["bnCurve"])} />
                        </Form.Group>
                        <Button type='submit' disabled={!Boolean(txOuts.length > 0)} onClick={(event) => handleSubmit(event)} color="green">Send</Button>
                    </Form>
                </Segment>
            </Grid.Row>
            <Grid.Row>
                <Container>
                    <Segment raised>
                        <p>{txOuts.length === 0 ? "No outputs added!" : ""}</p>
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