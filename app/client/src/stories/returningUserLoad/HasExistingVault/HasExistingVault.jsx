import React, { useEffect, useState } from 'react';

import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';
import ForgottenVaultPasswordModal from './ForgottenVaultPasswordModal';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormState } from 'hooks/_hooks';

import { VAULT_ACTIONS } from 'redux/actions/_actions';
import { electronStoreCommonActions } from 'store/electronStoreHelper';

import Page from 'layout/Page';

function UnlockExistingVault() {

    const history = useHistory();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const [showForgottenVaultPasswordModal, setShowForgottenVaultPasswordModal] = useState(false);

    const [formState, formSetter, onSubmit] = useFormState([
        {
            name: 'password',
            type: 'string',
            validation: {
                check: async (password) => await electronStoreCommonActions.checkPasswordAgainstPreflightHash(password), // Check password against preflight hash
                message: 'Vault password incorrect. Please try again.'
            }
        }
    ]);

    const { vaultLocked, vaultExists } = useSelector(state => ({ vaultLocked: state.vault.is_locked, vaultExists: state.vault.exists }));

    // Make sure vault is actually locked
    useEffect(() => {
        if (!vaultLocked && vaultExists) {
            history.push('/hub');
        }
    });

    const handleFormSubmit = async () => {
        setLoading(true);
        dispatch(VAULT_ACTIONS.loadSecureHDVaultFromStorage(formState.password.value));
    };

    useEffect(() => {
        if (formState.password.error) {
            setShowForgottenVaultPasswordModal(true);
        }
    }, [formState]);

    const [passwordHint, setPasswordHint] = useState('');

    useEffect(() => {
        const checkForPasswordHint = async () => {
            let passwordHint = await electronStoreCommonActions.readPasswordHint();
            setPasswordHint(passwordHint);
        }
        checkForPasswordHint();
    }, []);

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Welcome Back" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-sm">

                    <p>Please enter your password to unlock your wallets.</p>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center">

                    <Form onSubmit={() => onSubmit(handleFormSubmit)} className="mini-error-form">

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

                            <ForgottenVaultPasswordModal incorrectPwEntered={showForgottenVaultPasswordModal} />

                        </Form.Group>

                        <div>
                            <span className="font-bold text-gray-600">Password Hint:</span>
                            <span className="text-gray-400 ml-2">
                                {passwordHint}
                            </span>
                        </div>

                    </Form>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-center">

                        <Button loading={loading} color="teal" content="Unlock Vault" disabled={!formState.password.value} onClick={() => onSubmit(handleFormSubmit)} />

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default UnlockExistingVault;