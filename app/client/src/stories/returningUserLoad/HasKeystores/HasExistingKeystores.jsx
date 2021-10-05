import React from 'react';

import { Button, Container, Form, Grid, Header, Icon } from 'semantic-ui-react';
import ForgottenKeystorePasswordModal from './ForgottenKeystorePasswordModal';

import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormState } from 'hooks/_hooks';

import { VAULT_ACTIONS } from 'redux/actions/_actions'
import { electronStoreCommonActions } from '../../../store/electronStoreHelper'

import Page from '../../../layout/Page';

function HasExistingKeystores() {

    const history = useHistory();
    const dispatch = useDispatch();

    const [formState, formSetter] = useFormState(["password"]);
    const incorrectPasswordError = "Password incorrect. Please try again.";
    const incorrectPwEntered = formState.password.error === incorrectPasswordError;
    const [showPassword, setShowPassword] = React.useState(false);

    const [keystores, setKeystores] = React.useState([]);
    const [activeKeystore, setActiveKeystore] = React.useState(0);

    const [parsedKeystores, setParsedKeystores] = React.useState(false);

    // Onload, check for existing keystores and, in sequence request the passwords for them
    React.useEffect(() => {
        formSetter.setPassword("testing");
        const checkForKeystores = async () => {
            let keystores = await electronStoreCommonActions.checkForOptoutStores();
            setKeystores(keystores);
        }
        checkForKeystores();
    }, [])

    console.log(keystores);

    const handleFormSubmit = async () => {
        // Check password against preflight hash
        const pw = formState.password.value;
        const isCorrectPassword = await electronStoreCommonActions.checkPasswordAgainstPreflightHash(pw);
        if (!isCorrectPassword) {
            return formSetter.setPasswordError(incorrectPasswordError)
        }
        else { formSetter.clearPasswordError(); }
        // Dispatch the vault generation action and. . .
        let loaded = await dispatch(VAULT_ACTIONS.loadSecureHDVaultFromStorage(pw))
        if (loaded) {
            history.push('/hub')
        }
    }

    const skipStore = () => {
        console.log("SKIP");
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Welcome Back" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-sm">

                    <p>Your keystores will be loaded in sequence</p>

                    <p>Please enter your password for each requested keystore to unlock your wallets.</p>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center">

                    <Form onSubmit={(event => handleFormSubmit(event))}>

                        <Form.Group className="flex flex-auto flex-col m-0 text-left text-sm gap-5 items-center h-32">

                            <Form.Input
                                className="w-80"
                                id='password'
                                label={'Password for keystore: ' + keystores[activeKeystore]?.name}
                                placeholder='Enter Password'
                                type={showPassword ? "text" : "password"}
                                onChange={e => {
                                    formSetter.setPassword(e.target.value)
                                }}
                                error={!!formState.password.error && {
                                    content: formState.password.error,
                                    pointing: 'above',
                                }}
                                icon={<Icon name={showPassword ? "eye" : "eye slash"} />}
                            />

                            {/* 
                            onClick={ () => setShowPassword(s => !s) } 
                            */}

                            <ForgottenKeystorePasswordModal incorrectPwEntered={incorrectPwEntered} />

                        </Form.Group>

                    </Form>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex justify-center">

                        <Button color="orange" basic content='Skip Store' className="m-0" onClick={skipStore} />
                        <Button color="teal" basic content='Unlock Store' disabled={!formState.password.value} className="m-0 ml-4" onClick={handleFormSubmit} />

                    </Container>

                </Grid.Column>

                <Grid.Column width={16}>
                    <Header as="h4">Keystores To Unlock: {keystores.length} </Header>
                    <Header as="h4">Keystores Unlocked:</Header>
                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default HasExistingKeystores;