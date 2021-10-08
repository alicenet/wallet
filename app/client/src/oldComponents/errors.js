import React from 'react';
import { Modal, Container, Divider } from "semantic-ui-react"

// Error display
function Errors(props) {
    return (
        <Modal
            size="tiny"
            onClose={() => props.states.setError(false)}
            open={Boolean(props.states.isError)}
            centered
        >
            <Modal.Content scrolling={true}>
                <Container textAlign="center" fluid>
                    <h2 className="b">Error!</h2>
                    <Divider />
                    {props.states.isError}
                </Container>
            </Modal.Content>
        </Modal>
    )
}
export default Errors;