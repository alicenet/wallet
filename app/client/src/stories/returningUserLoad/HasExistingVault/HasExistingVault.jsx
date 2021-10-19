import React from 'react';

import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';
import ForgottenVaultPasswordModal from './ForgottenVaultPasswordModal';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormState } from 'hooks/_hooks';

import { VAULT_ACTIONS } from 'redux/actions/_actions'
import { electronStoreCommonActions } from 'store/electronStoreHelper'

import Page from 'layout/Page';

function UnlockExistingVault() {

    const history = useHistory();
    const dispatch = useDispatch();

    const [formState, formSetter, onSubmit] = useFormState([
        {
            name: 'password',
            validation: {
                check: async (password) => await electronStoreCommonActions.checkPasswordAgainstPreflightHash(password), // Check password against preflight hash
                message: 'Vault password incorrect. Please try again.'
            }
        }
    ]);

    const { vaultLocked, vaultExists } = useSelector(state => ({ vaultLocked: state.vault.is_locked, vaultExists: state.vault.exists }));

    // Make sure vault is actually locked
    React.useEffect(() => {
        if (!vaultLocked && vaultExists) {
            history.push('/hub');
        }
    });

    const handleFormSubmit = async () => {
        let loaded = false; //await dispatch(VAULT_ACTIONS.loadSecureHDVaultFromStorage(formState.password.value))
        if (loaded) {
            history.push('/hub')
        }
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Welcome Back" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-sm">

                    <p>Please enter your password to unlock your wallets.</p>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center">

                    <Form onSubmit={(event => handleFormSubmit(event))}>

                        <Form.Group className="flex flex-auto flex-col m-0 text-left text-sm gap-5 items-center h-32">

                            <Form.Input
                                className="w-80"
                                id='password'
                                label='Password'
                                placeholder='Enter Password'
                                type='password'
                                onChange={e => formSetter.setPassword(e.target.value)}
                                error={!!formState.password.error && {
                                    content: formState.password.error,
                                    pointing: 'above',
                                }}
                            />

                            <ForgottenVaultPasswordModal incorrectPwEntered={!!formState.password.error}/>

                        </Form.Group>

                    </Form>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-center">

                        <Button color="teal" basic content='Unlock Vault' disabled={!formState.password.value} className="m-0" onClick={() => onSubmit(handleFormSubmit)}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default UnlockExistingVault;