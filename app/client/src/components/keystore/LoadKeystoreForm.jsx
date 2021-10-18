import React from 'react'
import { useFormState } from 'hooks/_hooks';
import { Form, Header, Message } from 'semantic-ui-react';
import { walletUtils } from 'util/_util';

export default function LoadKeystoreForm() {

    const [formState, formSetter] = useFormState([{ name: 'password', type: 'password', isRequired: true }]);
    const [keystore, setKeystore] = React.useState(false);
    const [error, setError] = React.useState(false);

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

    const loadKeystore = () => {
        let unlocked = walletUtils.unlockKeystore(keystore, formState.password.value)
        if (unlocked.error) {
            setError(unlocked.error.message)
        }
        console.log(unlocked);
    }

    return (

        <Form error={error} size="mini" className="max-w-lg">

            <Header as="h4">Load A Keystore</Header>

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
                action={{ content: "Unlock Keystore", size: "mini", onClick: loadKeystore }}
                type="password" value={formState.password.value}
                onChange={e => formSetter.setPassword(e.target.value)}
            />

            <Message error>{error}</Message>

        </Form>

    )

}