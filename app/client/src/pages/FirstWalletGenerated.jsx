import React from 'react';

import {Button, Form, Grid, Header} from 'semantic-ui-react';

import {useHistory} from 'react-router-dom';

import Page from '../layout/Page';

function FirstWalletGenerated() {

    const [formState, setFormState] = React.useState({
        password: {value: ''},
        verifiedPassword: {value: ''}
    });

    const history = useHistory();

    const handleFormSubmit = () => {
        if (!formState.password.value) {
            setFormState(prevState => {
                return {
                    ...prevState,
                    password: {
                        value: prevState.password.value,
                        error: 'Password is required'
                    }
                }
            });
        } else {
            setFormState(prevState => {
                return {
                    ...prevState,
                    password: {
                        value: prevState.password.value
                    }
                };
            });
        }

        if (formState.password.value?.length > 0) {
            if (formState.password.value !== formState.verifiedPassword.value) {
                setFormState(prevState => {
                    return {
                        ...prevState,
                        verifiedPassword: {
                            value: prevState.verifiedPassword.value,
                            error: 'Passwords do not match'
                        }
                    };
                });
            } else {
                setFormState(prevState => {
                    return {
                        ...prevState,
                        verifiedPassword: {
                            value: prevState.verifiedPassword.value
                        }
                    };
                });
            }
        }
    }

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
                                defaultValue={formState.password.value}
                                onChange={e => {
                                    setFormState({...formState, password: {value: e.target.value}});
                                }}
                                error={formState.password.error && {
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
                                defaultValue={formState.verifiedPassword.value}
                                onChange={e => {
                                    setFormState({...formState, verifiedPassword: {value: e.target.value}});
                                }}
                                error={formState.verifiedPassword.error && {
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