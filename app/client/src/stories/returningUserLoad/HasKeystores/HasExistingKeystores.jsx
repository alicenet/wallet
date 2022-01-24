import React, { useEffect, useState } from 'react';

import { Button, Container, Form, Grid, Header, Icon } from 'semantic-ui-react';
import ForgottenKeystorePasswordModal from './ForgottenKeystorePasswordModal';

import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormState } from 'hooks/_hooks';
import { toast } from 'react-toastify';
import has from 'lodash/has';

import { ADAPTER_ACTIONS, VAULT_ACTIONS } from 'redux/actions/_actions'
import { electronStoreCommonActions } from 'store/electronStoreHelper'

import utils from 'util/_util';
import Page from 'layout/Page';
import { SyncToastMessageWarning } from 'components/customToasts/CustomToasts';
import { VAULT_ACTION_TYPES } from 'redux/constants/_constants';

function HasExistingKeystores() {

    const history = useHistory();
    const dispatch = useDispatch();

    const [showForgottenPasswordModal, setShowForgottenPasswordModal] = useState(false);
    const [formState, formSetter, onSubmit] = useFormState([
        {
            name: 'password',
            type: 'password',
            value: '',
            isRequired: true,
            validation: {
                check: async (password) => {
                    let ksData = keystoreData[activeKeystore];
                    let ks = JSON.parse(ksData.keystore);
                    let unlocked = utils.wallet.unlockKeystore(ks, password);
                    return !has(unlocked, 'error');
                }, // Try to unlock active keystore
                message: 'Incorrect keystore password. Try again.'
            }
        }
    ]);
    const [showPassword, setShowPassword] = useState(false);
    const [keystoreData, setKeystoreData] = useState([]); // Collection of stores
    const [keystoreUnlocked, setKeystoreUnlocked] = useState(false);
    const [activeKeystore, setActiveKeystore] = useState(0);
    const [activeAddress, setActiveAddress] = useState("");
    const [notEnoughKeystoresError, setNotEnoughKeystoresError] = useState(false);

    const dispatchOnceLoaded = () => {
        dispatch({ type: VAULT_ACTION_TYPES.MARK_UNLOCKED });
        dispatch(ADAPTER_ACTIONS.initAdapters())
        history.push('/hub')
    };

    // Parse active address
    const handleFormSubmit = async () => {
        // Add the keystore to external wallets state
        let ksData = keystoreData[activeKeystore];
        let ks = JSON.parse(ksData.keystore);
        dispatch(VAULT_ACTIONS.addExternalWalletToState(ks, formState.password.value, ksData.name))
        formSetter.setPassword("");
        setActiveKeystore(s => s + 1); // Go to next keystore
        setKeystoreUnlocked(true);
        // +1 to adjust for state change above that hasn't happened yet -- Checking if anymore keystores remain to look at
        if (keystoreData.length - (activeKeystore + 1) === 0) {
            dispatchOnceLoaded();
        }
    };

    const skipStore = () => {
        // If this is the last keystore and no keystores have been loaded show error
        if (keystoreData.length - (activeKeystore + 1) === 0) {
            if (keystoreUnlocked) {
                dispatchOnceLoaded();
            }
            else {
                return setNotEnoughKeystoresError(true);
            }
        }
        else {
            formSetter.setPassword("");
            setActiveKeystore(s => s + 1);
        }
    };

    // Onload, check for existing keystores and, in sequence request the passwords for them
    useEffect(() => {
        const checkForKeystores = async () => {
            let keystoreData = await electronStoreCommonActions.checkForOptoutStores();
            setKeystoreData(keystoreData);
        }
        checkForKeystores();
    }, []);

    useEffect(() => {
        try {
            let address = utils.string.splitStringWithEllipsis(JSON.parse(keystoreData[activeKeystore]?.keystore).address, 4);
            setActiveAddress(address);
        } catch (ex) {
            setActiveAddress("");
        }
    }, [activeKeystore, keystoreData]);

    useEffect(() => {
        if (formState.password.error) {
            setShowForgottenPasswordModal(true);
        }
    }, [formState]);

    useEffect(() => {
        if (notEnoughKeystoresError) {
            toast.error(
                <SyncToastMessageWarning
                    title="Error"
                    message="One keystore must be loaded."/>,
                { autoClose: 3000, onClose: () => { setNotEnoughKeystoresError(false) } });
        }
    }, [notEnoughKeystoresError]);

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Welcome Back" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-sm">

                    <p>As a vault optout, your keystores will be loaded in sequence</p>

                    <p>Please enter your password for each requested keystore to unlock your wallets.</p>

                </Grid.Column>

                <Grid.Column width={16} verticalAlign="middle">
                    <div className="text-sm">
                        <span className="font-bold">Password for:</span> {keystoreData[activeKeystore]?.name} ( {activeAddress} )
                    </div>
                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Form onSubmit={() => onSubmit(handleFormSubmit)} className="mini-error-form">

                        <Form.Group className="flex flex-auto flex-col m-0 text-left text-sm gap-5 items-center h-32">

                            <Form.Input
                                className="w-80"
                                id='password'
                                label={`Password`}
                                placeholder='Enter Password'
                                value={formState.password.value}
                                type={showPassword ? "text" : "password"}
                                onChange={e => formSetter.setPassword(e.target.value)}
                                error={!!formState.password.error && {
                                    content: formState.password.error,
                                    pointing: 'above',
                                }}
                                icon={<Icon name={showPassword ? "eye" : "eye slash"} link onClick={() => setShowPassword(s => !s)}/>}
                            />

                            <ForgottenKeystorePasswordModal incorrectPwEntered={showForgottenPasswordModal}/>

                            <div className="font-xs">
                                {activeKeystore} / {keystoreData.length} keystores examined
                            </div>

                        </Form.Group>

                    </Form>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex justify-between gap-2">

                        <Button color="orange" basic content='Skip This Store' onClick={skipStore}/>

                        <Button color="teal" basic content='Unlock Store' disabled={!formState.password.value} onClick={() => onSubmit(handleFormSubmit)}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default HasExistingKeystores;