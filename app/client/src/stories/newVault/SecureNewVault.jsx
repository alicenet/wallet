import React from 'react';

import { Button, Container, Form, Grid, Header, Message } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormState } from 'hooks/_hooks';

import { VAULT_ACTIONS } from 'redux/actions/_actions'

import Page from 'layout/Page';

function SecureNewVault() {

    const history = useHistory();
    const dispatch = useDispatch();
    const { seedPhrase, desiredCurve } = useSelector(state => ({
        seedPhrase: state.user.potential_seed_phrase,
        desiredCurve: state.user.desired_hd_curve
    }));

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'password', display: 'Password', type: 'password', isRequired: true },
        { name: 'verifiedPassword', display: 'Verify Password', type: 'verified-password', isRequired: true }
    ]);

    const handleFormSubmit = () => {
        dispatch(VAULT_ACTIONS.generateNewSecureHDVault(seedPhrase, formState.password.value, desiredCurve))
        history.push("/hub");
    };

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Vault and First Wallet Generated" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <p className="text-green-400">

                        <strong>Your vault and first wallet has been created!</strong>

                    </p>

                </Grid.Column>

                <Grid.Column width={10} className="p-0 self-center text-sm">

                    <p>Please select a password to secure your vault.</p>

                    <p>This password will be used to lock your wallets when you are not using them as well as to perform
                        general wallet administrative tasks such as exporting private keys. Do not lose it!</p>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center">

                    <Form onSubmit={() => onSubmit(handleFormSubmit)} className="mini-error-form">

                        <Form.Group className="flex flex-auto flex-col m-0 text-left text-sm gap-5">

                            <Form.Input
                                className='p-0'
                                id='password'
                                label='Password'
                                placeholder='Enter Password'
                                type='password'
                                required
                                onChange={e => formSetter.setPassword(e.target.value)}
                                error={!!formState.password.error && { content: formState.password.error }}
                            />

                            <Form.Input
                                className='p-0'
                                id='verify-password'
                                label='Verify Password'
                                placeholder='Enter Password'
                                type='password'
                                required
                                onChange={e => formSetter.setVerifiedPassword(e.target.value)}
                                error={!!formState.verifiedPassword.error && { content: formState.verifiedPassword.error }}
                            />

                        </Form.Group>

                    </Form>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Message
                        icon="warning"
                        header="The vault password and recovery phrase are very important."
                        content="Keep the recovery seed in a safe place so you can recover you wallets if necessary."
                        warning
                    />

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <Button color="black" basic content="Cancel Vault Creation" onClick={() => history.push('/')} />

                        <Button color="teal" content="Secure My Wallets" onClick={() => onSubmit(handleFormSubmit)} />

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default SecureNewVault;