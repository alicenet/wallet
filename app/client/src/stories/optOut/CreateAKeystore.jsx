import React from 'react';

import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormState } from 'hooks/_hooks';

import { VAULT_ACTIONS } from 'redux/actions/_actions'

import Page from '../../layout/Page';

function CreateAKeystore() {

    const history = useHistory();
    const dispatch = useDispatch();
    const { seedPhrase, desiredCurve } = useSelector(state => ({
        seedPhrase: state.user.potential_seed_phrase,
        desiredCurve: state.user.desired_hd_curve
    }));

    const [formState, formSetter] = useFormState(["name", "password", "verifiedPassword"]);

    const handleFormSubmit = () => {
        if (!formState.name.value) {
            return formSetter.setNameError("Name is required");
        }
        else {
            formSetter.clearNameError()
        }

        if (!formState.password.value) {
            return formSetter.setPasswordError("Password is required");
        }
        else {
            formSetter.clearPasswordError()
        }

        if (formState.password.value.length < 7) {
            return formSetter.setPasswordError("Password must be at least 8 characters long.");
        }
        else {
            formSetter.clearPasswordError()
        }

        if (formState.password.value !== formState.verifiedPassword.value) {
            return formSetter.setVerifiedPasswordError("Password do not match.");
        }
        else {
            formSetter.clearVerifiedPasswordError()
        }

        // Dispatch the vault generation action and. . .
        dispatch(VAULT_ACTIONS.generateNewSecureHDVault(seedPhrase, formState.password.value, desiredCurve))
        history.push("/hub");
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Create A Keystore" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-sm">

                    <p>Please select a password to secure your keystore and act as a general administration password.</p>

                    <p>The keystore password will be used to lock your keystore. You will need it to load this wallet again.</p>

                    <p>The administrative password is used for general administrative tasks.</p>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center">

                    <Form onSubmit={(event => handleFormSubmit(event))}>

                        <Form.Group className="flex flex-auto flex-col m-0 text-left text-sm gap-5">

                            <Form.Input
                                id='name'
                                label='Keystore Name'
                                placeholder='Enter Name'
                                type='text'
                                required
                                onChange={e => {
                                    formSetter.setName(e.target.value)
                                }}
                                error={!!formState.name.error && {
                                    content: formState.name.error
                                }}
                            />

                            <Form.Input
                                id='password'
                                label='Keystore Password'
                                placeholder='Enter Password'
                                type='password'
                                required
                                onChange={e => {
                                    formSetter.setPassword(e.target.value)
                                }}
                                error={!!formState.password.error && {
                                    content: formState.password.error
                                }}
                            />

                            <Form.Input
                                id='verify-password'
                                label='Verify Password'
                                placeholder='Enter Password'
                                type='password'
                                required
                                onChange={e => {
                                    formSetter.setVerifiedPassword(e.target.value)
                                }}
                                error={!!formState.verifiedPassword.error && {
                                    content: formState.verifiedPassword.error
                                }}
                            />

                        </Form.Group>

                    </Form>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <Button color="red" basic content="Back" className="m-0" onClick={() => history.push('/optOut/disclaimer')}/>

                        <Button color="teal" basic content='Secure My Wallets' className="m-0" onClick={handleFormSubmit}/>

                    </Container>
                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default CreateAKeystore;