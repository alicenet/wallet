import React, { useState, useEffect, useContext } from 'react';
import { Modal, Container, Segment, Accordion, Icon, List, Divider } from "semantic-ui-react"
import { StoreContext } from "../../Store/store.js";

//BlockNotify display
function BlockNotify(props) {
    const { store } = useContext(StoreContext); 
    let [txDrop, setTxDrop] = useState(false);

    useEffect(() => {
        setTxDrop(false);
    }, []);

    const txList = () => {
        if (!props.states.isBlockNotify['TxHshLst']) {
            return (<p></p>)
        }
        return props.states.isBlockNotify['TxHshLst'].map((e, i) => {
            return (
                <List.Item className="click" onClick={() => {store.madNetAdapter.viewTransaction(e, true); props.states.setBlockNotify(false) }} key={i}>{e}</List.Item>
            )
        })
    }

    if (!props.states.isBlockNotify) {
        return (<></>)
    }
    else {
        return (
            <Modal
                size="large"
                onClose={() => props.states.setBlockNotify(false)}
                open={Boolean(props.states.isBlockNotify)}
                centered
                dimmer='blurring'
            >
                <Modal.Content className="blocksModal" scrolling={true}>
                    <Container textAlign="center" fluid>
                        <Segment.Group compact={true} >
                            <Segment className="notifySegments" textAlign="left">Height: {props.states.isBlockNotify['BClaims']['Height']}</Segment>
                            <Segment className="notifySegments" textAlign="left">Transaction Count: {props.states.isBlockNotify['BClaims']['TxCount'] ? props.states.isBlockNotify['BClaims']['TxCount'] : 0}</Segment>
                            <Segment className="notifySegments" textAlign="left">Previous Block: {props.states.isBlockNotify['BClaims']['PrevBlock']}</Segment>
                            <Segment className="notifySegments" textAlign="left">Transaction Root: {props.states.isBlockNotify['BClaims']['TxRoot']}</Segment>
                            <Segment className="notifySegments" textAlign="left">State Root: {props.states.isBlockNotify['BClaims']['StateRoot']}</Segment>
                            <Segment className="notifySegments" textAlign="left">Header Root: {props.states.isBlockNotify['BClaims']['HeaderRoot']}</Segment>
                            <Segment className="notifySegments" textAlign="left">Group Signature: {props.states.isBlockNotify['SigGroup']}</Segment>
                            <Segment className="notifySegments" textAlign="left">


                                <Accordion fluid styled>
                                    <Accordion.Title
                                        active={txDrop}
                                        onClick={() => { if (props.states.isBlockNotify['TxHshLst'] && props.states.isBlockNotify['TxHshLst'].length > 0) { setTxDrop(!txDrop) } }}
                                    >
                                        <Icon name='dropdown' />
                                        Transaction Hash List
                                    </Accordion.Title>
                                    <Accordion.Content active={txDrop}>
                                        <List bulleted>
                                            <Divider />
                                            {txList()}
                                        </List>
                                    </Accordion.Content>
                                </Accordion>

                            </Segment>
                        </Segment.Group>
                    </Container>
                </Modal.Content>
            </Modal>
        )
    }
}
export default BlockNotify;