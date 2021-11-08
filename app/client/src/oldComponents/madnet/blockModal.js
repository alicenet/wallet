import React, { useState, useEffect, useContext } from 'react';
import { Modal, Segment, Accordion, Icon, List, Divider } from "semantic-ui-react"
import { StoreContext } from "../../oldStore/store.js";
import Help from '../help.js';

// BlockModal display
function BlockModal(props) {
    const { store } = useContext(StoreContext);
    let [txDrop, setTxDrop] = useState(false);
    let [blockInfo, setBlockInfo] = useState(false);

    // Setup data on mount
    useEffect(() => {
        if (props.states.isBlockModal) {
            setBlockInfo(props.states.isBlockModal)
        }
        setTxDrop(false);
        return () => setBlockInfo(false);
    }, [props.states.isBlockModal]);

    // Display BlockData
    const txList = () => {
        if (!blockInfo['TxHshLst']) {
            return (<p/>)
        }
        return blockInfo['TxHshLst'].map((e, i) => {
            return (
                <List.Item className="click" onClick={() => { store.madNetAdapter.viewTransaction(e, true); setBlockInfo(false) }} key={i}>0x{e}</List.Item>
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
                onClose={() => props.states.setBlockModal(false)}
                open={Boolean(blockInfo)}
                centered
                className="blocksModal"
                scrolling="true"
            >
                <Segment.Group compact={true} >
                    <Segment className="notifySegments" textAlign="left">{<Help type='height' />}Height: {blockInfo['BClaims']['Height']}</Segment>
                    <Segment className="notifySegments" textAlign="left">{<Help type='txCount' />}Transaction Count: {blockInfo['BClaims']['TxCount'] ? blockInfo['BClaims']['TxCount'] : 0}</Segment>
                    <Segment className="notifySegments" textAlign="left">{<Help type='previousBlock' />}Previous Block: 0x{blockInfo['BClaims']['PrevBlock']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + blockInfo['BClaims']['PrevBlock'])} /></Segment>
                    <Segment className="notifySegments" textAlign="left">{<Help type='txRoot' />}Transaction Root: 0x{blockInfo['BClaims']['TxRoot']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + blockInfo['BClaims']['TxRoot'])} /></Segment>
                    <Segment className="notifySegments" textAlign="left">{<Help type='stateRoot' />}State Root: 0x{blockInfo['BClaims']['StateRoot']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + blockInfo['BClaims']['StateRoot'])} /></Segment>
                    <Segment className="notifySegments" textAlign="left">{<Help type='headerRoot' />}Header Root: 0x{blockInfo['BClaims']['HeaderRoot']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + blockInfo['BClaims']['HeaderRoot'])} /></Segment>
                    <Segment className="notifySegments" textAlign="left">{<Help type='groupSignature' />}Group Signature: 0x{blockInfo['SigGroup']}<Icon name="copy outline" className="click" onClick={() => props.states.copyText("0x" + blockInfo['SigGroup'])} /></Segment>
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