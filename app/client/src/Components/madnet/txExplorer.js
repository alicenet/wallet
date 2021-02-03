import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from "../../Store/store.js";
import { Container, Button, Form, Segment, Grid, Menu } from 'semantic-ui-react';
import Switch from "react-switch";

function TransactionExplorer() {
    // Store states
    const { store } = useContext(StoreContext);
    // Search hash
    const [txHash, setTxHash] = useState(false);
    const [rawVin, setRawVin] = useState(false);
    const [rawVout, setRawVout] = useState(false);

    // Reset state on mount
    useEffect(() => {
        return () => {
            setTxHash(false);
            store.madNetAdapter.transactionHash = false;
            store.madNetAdapter.transaction = false;
        }
    }, []);

    // Update search params
    const handleChange = (event, e) => {
        if (e === "rawVin") {
            setRawVin(event);
            return;
        }
        else if (e === "rawVout") {
            setRawVout(event);
            return;
        }
        setTxHash(event.target.value)
    }

    // Sumbit initial query params
    const handleSubmit = (event) => {
        event.preventDefault()
        store.madNetAdapter.viewTransaction(txHash);
    }

    // Vin objects
    const vin = (data) => {
        if (rawVin) {
            return data.map((e, i) => {
                return (
                    <Segment.Group className="txView" key={i}>
                        <Segment textAlign="left">
                            <pre>{JSON.stringify(e, null, 2)}</pre>
                        </Segment>
                    </Segment.Group>
                )
            });
        }
        else {
            return data.map((e, i) => {
                return (
                    <Segment.Group className="txView" key={i}>
                        <Segment className="notifySegments" textAlign="left">Consumed Transaction: {e['TXInLinker']['TXInPreImage']['ConsumedTxHash']}</Segment>
                        <Segment className="notifySegments" textAlign="left">Consumed Transaction Index: {e['TXInLinker']['TXInPreImage']['ConsumedTxIdx'] ? e['TXInLinker']['TXInPreImage']['ConsumedTxIdx'] : 0}</Segment>
                        <Segment className="notifySegments" textAlign="left">Signature: {e['Signature']}</Segment>
                    </Segment.Group>
                )
            });
        }
    }

    // Vout objects
    const vout = (data) => {
        if (rawVout) {
            return data.map((e, i) => {
                return (
                    <Segment.Group className="txView" key={i} >
                        <Segment textAlign="left">
                            <pre>{JSON.stringify(e, null, 2)}</pre>
                        </Segment>
                    </Segment.Group>
                )
            });
        }
        else {
            return data.map((e, i) => {
                return (
                    <Segment.Group className="txView" key={i}>
                        <Segment className="notifySegments" textAlign="left">Type: {Object.keys(e)[0]}</Segment>
                        {voutFormatter(Object.keys(e)[0], e[Object.keys(e)[0]])}
                    </Segment.Group>
                )
            });
        }
    }

    // Format Vout objects based on tx type
    const voutFormatter = (type, object) => {
        switch(type) {
            case "ValueStore":
                return (
                    <>
                    <Segment className="notifySegments" textAlign="left">Value: {object['VSPreImage']['Value'] ? object['VSPreImage']['Value'] : 0}</Segment>
                    <Segment className="notifySegments" textAlign="left">Owner: {object['VSPreImage']['Owner']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Transaction Index: {object['VSPreImage']['TXOutIdx'] ? object['VSPreImage']['TXOutIdx'] : 0}</Segment>
                    </>
                );;
            case 'DataStore':
                return (
                <>
                    <Segment className="notifySegments" textAlign="left">Index: {object['DSLinker']['DSPreImage']['Index'] ? object['DSLinker']['DSPreImage']['Index'] : 0}</Segment>
                    <Segment className="notifySegments" textAlign="left">Raw Data: {object['DSLinker']['DSPreImage']['RawData']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Issued At: {object['DSLinker']['DSPreImage']['IssuedAt']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Deposit: {object['DSLinker']['DSPreImage']['Deposit']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Transaction Index: {object['DSLinker']['DSPreImage']['TXOutIdx'] ? object['DSLinker']['DSPreImage']['TXOutIdx'] : 0}</Segment>
                    <Segment className="notifySegments" textAlign="left">Signature: {object['Signature']}</Segment>
                </>
                );;
            default:
                return (
                    <></>
                );;;
        }

    }

    // Get txData from madnet adapter
    const getData = () => {
        if (!store.madNetAdapter.transaction) {
            return (
                <Segment>
                    <p>No Transaction to display!</p>
                </Segment>
            )
        }
        else {
            return (
                <>
                    <Segment.Group raised>
                        <Grid.Row textAlign="right">
                            <Form.Group className="txSwitch switch" inline>
                                <label className="b">JSON</label>
                                <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event) => { handleChange(event, "rawVin") }} checked={Boolean(rawVin)} />
                            </Form.Group>
                        </Grid.Row>
                        <Segment className="notifySegments">
                            Vin
                        </Segment>
                        {vin(store.madNetAdapter.transaction["Vin"])}
                    </Segment.Group>
                    <Segment.Group raised>
                        <Grid.Row textAlign="right">
                            <Form.Group className="txSwitch switch" inline>
                                <label className="b">JSON</label>
                                <Switch onColor="#4aec75" height={22} width={46} offColor="#ff6464" offHandleColor="#212121" onHandleColor="#f0ece2" onChange={(event) => { handleChange(event, "rawVout") }} checked={Boolean(rawVout)} />
                            </Form.Group>
                        </Grid.Row>
                        <Segment className="notifySegments">
                            Vout
                        </Segment>
                        {vout(store.madNetAdapter.transaction["Vout"])}
                    </Segment.Group>
                </>
            )
        }
    }

    // Render
    return (
        <Grid stretched centered>
            <Container textAlign="center"></Container>
            <Grid.Row stretched centered>
                <Segment raised>
                    <Form fluid="true">
                        <Form.Group>
                            <Form.Input onChange={(event) => { handleChange(event) }} label='Tx Hash' placeholder='0x...' />
                        </Form.Group>
                        <Button color="blue" onClick={(event) => handleSubmit(event)}>Search</Button>
                    </Form>
                </Segment>
            </Grid.Row>
            <Grid.Row centered>
                <Container centered="true">
                    <h4>{store.madNetAdapter.transactionHash ? "Tx Hash: " + store.madNetAdapter.transactionHash : ""}</h4>
                    {getData()}
                </Container>
            </Grid.Row>
        </Grid>
    )
}
export default TransactionExplorer;