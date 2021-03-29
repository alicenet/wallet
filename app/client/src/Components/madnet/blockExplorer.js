import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from "../../Store/store.js";
import { Container, Button, Form, Segment, Grid } from 'semantic-ui-react';

function BlockExplorer(props) {
    // Store states
    const { store } = useContext(StoreContext);
    let [blockNumber, setBlockNumber] = useState(false);

    // Start monitor when component mounts
    useEffect(() => {
        if (store && store.madNetAdapter && !store.madNetAdapter.blocksStarted) {
            store.madNetAdapter.monitorBlocks();
        }
        return () => { if (store && store.madNetAdapter) { props.states.setBlockModal(false); store.madNetAdapter.blocksReset() } }
    }, [store.madNetAdapter]); // eslint-disable-line react-hooks/exhaustive-deps

    // Lookup specific block number
    const handleChange = (event) => {
        setBlockNumber(event.target.value);
    }

    // Sumbit initial query params
    const handleSubmit = async (event) => {
        event.preventDefault()
        store.madNetAdapter.viewBlock(blockNumber)
    }

    // Load blocks from madnet adapter
    const latestBlocks = () => {
        if (store.madNetAdapter.blocks.length <= 0) {
            return (<></>)
        }
        return store.madNetAdapter.blocks.map((e, i) => {
            return (
                <div className="blocks" key={i} onClick={() => store.madNetAdapter.viewBlock(e['BClaims']['Height'])}>
                    <Segment.Group compact={true} >
                        <Segment textAlign="left">Height: {e['BClaims']['Height']}</Segment>
                        <Segment className="notifySegments" textAlign="left">Tx Count: {e['BClaims']['TxCount'] ? e['BClaims']['TxCount'] : 0}</Segment>
                        <Segment textAlign="left">Group Signature: 0x{e['SigGroup'].slice(0, 20) + "..." + e['SigGroup'].slice(e['SigGroup'].length - 20)}</Segment>
                    </Segment.Group>
                    <br></br>
                </div>
            )
        });
    }

    // Render
    return (
        <>
            <Grid stretched centered >
                <Container textAlign="center"></Container>
                <Grid.Row stretched centered>
                    <Segment raised>
                        <Container fluid>
                            <h2>Latest Block: {store.madNetAdapter.blocks.length > 0 ? store.madNetAdapter.blocks[0]['BClaims']['Height'] : ""}</h2>
                            <Form.Input onChange={(event) => { handleChange(event) }} label='Block ' placeholder='1337' />
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
        </>
    )
}

export default BlockExplorer; 