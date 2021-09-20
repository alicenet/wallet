import { useFormState } from 'hooks/_hooks';
import React from 'react'
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router';
import { Container, Grid, Header, Form, Message } from 'semantic-ui-react';

export default function LoadKeystoreForm() {

    const [formState, formSetter] = useFormState(["password"])

    const [keystore, setKeystore] = React.useState(false);
    const [error, setError] = React.useState(false);

    const dispatch = useDispatch();

    const fileChange = (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onabort = () => { setError("Aborted loading keystore file") }
        reader.onerror = () => { setError("Error loading keystore file") }
        reader.onload = () => {
            setKeystore(reader.result);                        
        };
    }

    return (

        <Container>

            <Form error={error} size="mini">

                <Header as="h4">Load A Keystore</Header>

                <Form.Group>

                    <Form.Input 
                        size="mini"
                        type="file"
                        id="file"
                        onChange={(e) => fileChange(e)}
                        onClick={e => (e.target.value = null)}
                        label="Keystore"
                    />

                    <Form.Input 
                        label="Keystore Password" 
                        action={{content:"Unlock Keystore", size:"mini"}}
                        type="password" value={formState.password.value} 
                        onChange={e => formState.setPassword(e.target.value)}
                    />

                </Form.Group>

                <Message error>{error}</Message>

            </Form>

        </Container>


    )

}