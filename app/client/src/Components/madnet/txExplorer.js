import React, { useContext, useState } from 'react';
import { StoreContext } from "../../Store/store.js";
import { Container, Button, Form, Segment, Grid, Icon } from 'semantic-ui-react';
import Switch from "react-switch";
import Help from '../help.js';

function TransactionExplorer(props) {
    // Store states
    const { store } = useContext(StoreContext);
    // Search hash
    const [txHash, setTxHash] = useState(false);
    const [rawVin, setRawVin] = useState(false);
    const [rawVout, setRawVout] = useState(false);

    // Update Vin/Vout
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
                            <Icon name="copy outline" className="click" onClick={() => props.states.copyText(JSON.stringify(e, null, 2))} />
                        </Segment>
                    </Segment.Group>
                )
            });
        }
        else {
            return data.map((e, i) => {
                return (
                    <Segment.Group className="txView" key={i}>
                        <Segment className="notifySegments" textAlign="left">{<Help type='consumedTx' />}Consumed Transaction: 0x{e['TXInLinker']['TXInPreImage']['ConsumedTxHash']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + e['TXInLinker']['TXInPreImage']['ConsumedTxHash'])} /></Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='consumedTxIndex' />}Consumed Transaction Index: {e['TXInLinker']['TXInPreImage']['ConsumedTxIdx'] ? e['TXInLinker']['TXInPreImage']['ConsumedTxIdx'] : 0}</Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='signature' />}Signature: 0x{e['Signature']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + e['Signature'])} /></Segment>
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
                            <Icon name="copy outline" className="click" onClick={() => props.states.copyText(JSON.stringify(e, null, 2))} />
                        </Segment>
                    </Segment.Group>
                )
            });
        }
        else {
            return data.map((e, i) => {
                return (
                    <Segment.Group className="txView" key={i}>
                        <Segment className="notifySegments" textAlign="left">{<Help type={Object.keys(e)[0]} />}{Object.keys(e)[0]}</Segment>
                        {voutFormatter(Object.keys(e)[0], e[Object.keys(e)[0]])}
                    </Segment.Group>
                )
            });
        }
    }

    // Format Vout objects based on tx type
    const voutFormatter = (type, object) => {
        switch (type) {
            case "ValueStore":
                return (
                    <>
                        <Segment className="notifySegments" textAlign="left">{<Help type='value' />}Value: {object['VSPreImage']['Value'] ? store.madNetAdapter.hexToInt(object['VSPreImage']['Value']) : 0}</Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='owner' />}Owner: 0x{object['VSPreImage']['Owner'].slice(4)}{isBN(object['VSPreImage']['Owner'])}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + object['VSPreImage']['Owner'])} /></Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='txIndex' />}Transaction Index: {object['VSPreImage']['TXOutIdx'] ? object['VSPreImage']['TXOutIdx'] : 0}</Segment>
                    </>
                );;
            case 'DataStore':
                return (
                    <>
                        <Segment className="notifySegments" textAlign="left">{<Help type='index' />}Index: 0x{object['DSLinker']['DSPreImage']['Index'] ? object['DSLinker']['DSPreImage']['Index'] : 0}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + object['DSLinker']['DSPreImage']['Index'])} /></Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='rawData' />}Raw Data: 0x{object['DSLinker']['DSPreImage']['RawData']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + object['DSLinker']['DSPreImage']['RawData'])} /></Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='owner' />}Owner: 0x{object['DSLinker']['DSPreImage']['Owner'].slice(4)}{isBN(object['DSLinker']['DSPreImage']['Owner'])}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + object['DSLinker']['DSPreImage']['Owner'])} /><Icon className="click" name="external" onClick={() => { store.madNetAdapter.dsRedirected = { "address": object['DSLinker']['DSPreImage']['Owner'].slice(4), "offset": "", "bnCurve": object['DSLinker']['DSPreImage']['Owner'].slice(3, 4) === "1" ? false : true }; props.states.setMadnetPanel('dataExplorer') }} /></Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='epoch' />}Issued At: {object['DSLinker']['DSPreImage']['IssuedAt']}</Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='expires' />}Expires: {store.madNetAdapter.getDSExp(object['DSLinker']['DSPreImage']['RawData'], object['DSLinker']['DSPreImage']['Deposit'], object['DSLinker']['DSPreImage']['IssuedAt'])}</Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='deposit' />}Deposit: {store.madNetAdapter.hexToInt(object['DSLinker']['DSPreImage']['Deposit'])}</Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='txIndex' />}Transaction Index: {object['DSLinker']['DSPreImage']['TXOutIdx'] ? object['DSLinker']['DSPreImage']['TXOutIdx'] : 0}</Segment>
                        <Segment className="notifySegments" textAlign="left">{<Help type='signature' />}Signature: 0x{object['Signature']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + object['Signature'])} /></Segment>
                    </>
                );;
            default:
                return (
                    <></>
                );;;
        }

    }

    // Identify if the owner is a bn address
    const isBN = (owner) => {
        let bn = owner.slice(3, 4);
        if (bn === "1") {
            return (
                <></>
            )
        }
        else {
            return (
                <><Icon fitted className="green" name="check circle"></Icon><Icon fitted>BN</Icon></>
            )
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
                    <h3>{store.madNetAdapter.transactionHash ? "Tx Hash: " + store.madNetAdapter.transactionHash : ""} {store.madNetAdapter.transactionHash ? (<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + store.madNetAdapter.transactionHash)} />) : (<></>)}</h3>
                    <h4>{store.madNetAdapter.transactionHeight ? "Height: " + store.madNetAdapter.transactionHeight : ""} {store.madNetAdapter.transactionHeight ? (<Icon className="click" name="external" onClick={() => store.madNetAdapter.viewBlock(store.madNetAdapter.transactionHeight)} />) : (<></>)} </h4>
                    {getData()}
                </Container>
            </Grid.Row>
        </Grid>
    )
}
export default TransactionExplorer;