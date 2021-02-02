import React, { useContext, useState } from 'react';
import { StoreContext } from "../../Store/store.js";
import { Container, Button, Form, Segment, Card, Grid, Icon } from 'semantic-ui-react';

function TransactionExplorer(props) {
    // Store states
    const { store } = useContext(StoreContext);
    // Search hash
    const [txHash, setTxHash] = useState(false);

    // Update search params
    const handleChange = (event) => {
        setTxHash(event.target.value)
    }

    // Sumbit initial query params
    const handleSubmit = (event) => {
        event.preventDefault()
        store.madNetAdapter.viewTransaction(txHash);
    }

    const vin = (data) => {
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

    const vout = (data) => {
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

    // Get data from the RPC
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
                        <Segment>Vin</Segment>
                        {vin(store.madNetAdapter.transaction["Vin"])}
                    </Segment.Group>
                    <Segment.Group raised>
                        <Segment>Vout</Segment>
                        {vout(store.madNetAdapter.transaction["Vout"])}
                    </Segment.Group>
                </>
            )
        }
    }

    // Render
    return (
        <Grid stretched centered={true}>
            <Container textAlign="center"></Container>
            <Grid.Row stretched centered={true}>
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
                <Container centered>
                    <h4>{store.madNetAdapter.transactionHash ? "Tx Hash: " + store.madNetAdapter.transactionHash : ""}</h4>
                    {getData()}
                </Container>
            </Grid.Row>
        </Grid>
    )
}
export default TransactionExplorer;