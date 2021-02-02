import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from "../../Store/store.js";
import { Container, Button, Form, Segment, Grid, Modal, Divider } from 'semantic-ui-react';

function BlockExplorer(props) {
    // Store states
    const { store } = useContext(StoreContext);
    let [ blockNumber, setBlockNumber] = useState(false);

    useEffect(() => {
        if(store && store.madNetAdapter && !store.madNetAdapter.blocksStarted) {
            store.madNetAdapter.monitorBlocks();
        }
        return() => { if (store && store.madNetAdapter) { store.madNetAdapter.blocksReset()} }
    }, [store]);

    const handleChange = (event) => {
        setBlockNumber(event.target.value);
    }

    // Sumbit initial query params
    const handleSubmit = (event) => {
        event.preventDefault()
        store.madNetAdapter.viewBlock(blockNumber)
    }

    const latestBlocks = () => {
        if (store.madNetAdapter.blocks.length <= 0) {
            return (<></>)
        }
        return store.madNetAdapter.blocks.map((e,i) =>{
            return (
                <a className="blocks" key={i} onClick={() => store.madNetAdapter.viewBlock(e['BClaims']['Height'])}>
                <Segment.Group compact={true} >
                    <Segment textAlign="left">Height: {e['BClaims']['Height']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Tx Count: {e['BClaims']['TxCount'] ? e['BClaims']['TxCount'] : 0}</Segment>
                    <Segment textAlign="left">Group Signature: {e['SigGroup'].slice(0,20) + "..." + e['SigGroup'].slice(e['SigGroup'].length - 20)}</Segment>
                </Segment.Group>
                <br></br>
                </a>
            )
        });
    }

    return (
        <Grid stretched centered >
            <Container textAlign="center"></Container>
            <Grid.Row stretched centered>
                <Segment raised>
                    <Container fluid>
                    <h2>Latest Block: {store.madNetAdapter.blocks.length > 0 ? store.madNetAdapter.blocks[0]['BClaims']['Height'] : ""}</h2>
                            <Form.Input onChange={(event) => { handleChange(event) }} label='Block ' placeholder='' />
                        <Button color="blue" onClick={(event) => handleSubmit(event)}>Find</Button>
                    </Container>
                </Segment>
            </Grid.Row>
            <Grid.Row centered>
                    <Segment raised>
                        {latestBlocks()}
                    </Segment>

            </Grid.Row>
        </Grid>
    )
}

export default BlockExplorer; 