import React from 'react';
import { Modal, Container, Segment } from "semantic-ui-react"

//BlockNotify display
function BlockNotify(props) {
    if (!props.states.isBlockNotify) {
        return (<></>)
    }
    else {
        return (
            <Modal
                size="small"
                onClose={() => props.states.setBlockNotify(false)}
                open={Boolean(props.states.isBlockNotify)}
                centered
                dimmer='blurring'
                basic="true"
            >
                <Modal.Content className="blocksModal" scrolling={true}>
                    <Container textAlign="center" fluid>
                        <Segment.Group compact={true} >
                            <Segment className="notifySegments" textAlign="left">Height: {props.states.isBlockNotify['BClaims']['Height']}</Segment>
                            <Segment className="notifySegments" textAlign="left">Previous Block: {props.states.isBlockNotify['BClaims']['PrevBlock']}</Segment>
                            <Segment className="notifySegments" textAlign="left">Transaction Root: {props.states.isBlockNotify['BClaims']['TxRoot']}</Segment>
                            <Segment className="notifySegments" textAlign="left">State Root: {props.states.isBlockNotify['BClaims']['StateRoot']}</Segment>
                            <Segment className="notifySegments" textAlign="left">Header Root: {props.states.isBlockNotify['BClaims']['HeaderRoot']}</Segment>
                            <Segment className="notifySegments" textAlign="left">Group Signatures: {props.states.isBlockNotify['SigGroup']}</Segment>
                        </Segment.Group>
                    </Container>
                </Modal.Content>
            </Modal>
        )
    }
}
export default BlockNotify;