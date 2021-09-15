import React from 'react';

import {Button, Form, Grid, Header} from 'semantic-ui-react';

import {useHistory} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {useFormState} from 'hooks/_hooks';

import {VAULT_ACTIONS} from 'redux/actions/_actions'
import Page from '../layout/Page';

function FirstWalletGenerated() {

    const history = useHistory();
    const dispatch = useDispatch();
    const {seedPhrase, desiredCurve} = useSelector(state => ({
        seedPhrase: state.user.potential_seed_phrase,
        desiredCurve: state.user.desired_hd_curve
    }));

    const [formState, formSetter] = useFormState(["password", "verifiedPassword"]);

    const handleFormSubmit = () => {
        if (!formState.password.value) {
            return formSetter.setPasswordError("Password is required");
        } else {
            formSetter.clearPasswordError()
        }

        if (formState.password.value.length < 7) {
            return formSetter.setPasswordError("Password must be atleast 8 characters long.");
        } else {
            formSetter.clearPasswordError()
        }

        if (formState.password.value !== formState.verifiedPassword.value) {
            return formSetter.setVerifiedPasswordError("Password do not match.");
        } else {
            formSetter.clearVerifiedPasswordError()
        }

        // Dispatch the vault generation action and. . .
        dispatch(VAULT_ACTIONS.generateNewSecureHDVault(seedPhrase, formState.password.value, desiredCurve))
        history.push("/hub");
    }

    console.log(desiredCurve, seedPhrase);

    return (
        <Page>

            <Grid textAlign="center">

                <Grid.Column width={16} className="my-5">

                    <Header content="Vault and First Wallet Generated" as="h3" className="my-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="my-5">

                    <p className="text-green-400">

                        <strong>Your vault and first wallet has been created!</strong>

                    </p>

                </Grid.Column>

                <Grid.Column width={10} className="text-sm">

                    <p>One last thing!</p>

                    <p>Please select a password to secure your vault.</p>

                    <p>This password will be used to lock your wallets when you are not using them as well as to perform
                        general wallet administrative tasks such as exporting private keys. Do not lose it!</p>

                </Grid.Column>

                <Grid.Column width={8} className="my-5">

                    <Form onSubmit={(event => handleFormSubmit(event))}>

                        <Form.Group className="flex flex-auto flex-col m-0 text-left text-sm gap-5">

                            <Form.Input
                                id='password'
                                label='Password'
                                placeholder='Enter Password'
                                type='password'
                                required
                                onChange={e => {
                                    formSetter.setPassword(e.target.value)
                                }}
                                error={!!formState.password.error && {
                                    content: formState.password.error,
                                    pointing: 'below',
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
                                    content: formState.verifiedPassword.error,
                                    pointing: 'below',
                                }}
                            />

                        </Form.Group>

                    </Form>

                </Grid.Column>

                <Grid.Column width={16} className="flex flex-auto flex-row justify-around">

                    <Button color="purple" basic content="Back" className="w-52" onClick={() => history.push('/')}/>

                    <Button color="teal" basic content='Secure My Wallets' className="w-52" onClick={handleFormSubmit}/>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default FirstWalletGenerated;