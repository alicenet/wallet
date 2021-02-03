import React, { useState, useEffect, useContext } from 'react';
import { Modal, Container, Segment, Accordion, Icon, List, Divider } from "semantic-ui-react"
import { StoreContext } from "../../Store/store.js";

// BlockModal display
function BlockModal(props) {
    const { store } = useContext(StoreContext);
    let [txDrop, setTxDrop] = useState(false);
    let [blockInfo, setBlockInfo] = useState(false);

    // Setup data on mount
    useEffect(() => {
        if (props.isBlockModal) {
            setBlockInfo(props.isBlockModal)
        }
        setTxDrop(false);
        return () => setBlockInfo(false);
    }, [props.isBlockModal]);

    // Display BlockData
    const txList = () => {
        if (!blockInfo['TxHshLst']) {
            return (<p></p>)
        }
        return blockInfo['TxHshLst'].map((e, i) => {
            return (
                <List.Item className="click" onClick={() => { store.madNetAdapter.viewTransaction(e, true); setBlockInfo(false) }} key={i}>{e}</List.Item>
            )
        })
    }

    // Conditional render
    if (!blockInfo) {
        return (<></>)
    }
    else {
        return (
            <Modal
                size="large"
                onClose={() => props.setBlockModal(false)}
                open={Boolean(blockInfo)}
                centered
                dimmer='blurring'
                className="blocksModal"
                scrolling="true"
            >
                <Segment.Group compact={true} >
                    <Segment className="notifySegments" textAlign="left">Height: {blockInfo['BClaims']['Height']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Transaction Count: {blockInfo['BClaims']['TxCount'] ? blockInfo['BClaims']['TxCount'] : 0}</Segment>
                    <Segment className="notifySegments" textAlign="left">Previous Block: {blockInfo['BClaims']['PrevBlock']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Transaction Root: {blockInfo['BClaims']['TxRoot']}</Segment>
                    <Segment className="notifySegments" textAlign="left">State Root: {blockInfo['BClaims']['StateRoot']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Header Root: {blockInfo['BClaims']['HeaderRoot']}</Segment>
                    <Segment className="notifySegments" textAlign="left">Group Signature: {blockInfo['SigGroup']}</Segment>
                    <Segment className="notifySegments" textAlign="left">


                        <Accordion fluid styled>
                            <Accordion.Title
                                active={txDrop}
                                onClick={() => { if (blockInfo['TxHshLst'] && blockInfo['TxHshLst'].length > 0) { setTxDrop(!txDrop) } }}
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
            </Modal>
        )
    }
}
export default BlockModal;