import React from 'react';

import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormState } from 'hooks/_hooks';

import GenerateKeystoreForm from 'components/keystore/GenerateKeystoreForm';

import { VAULT_ACTIONS } from 'redux/actions/_actions'

import Page from 'layout/Page';

function CreateAKeystore() {

    const history = useHistory();
    const dispatch = useDispatch();
    const { seedPhrase, desiredCurve } = useSelector(state => ({
        seedPhrase: state.user.potential_seed_phrase,
        desiredCurve: state.user.desired_hd_curve
    }));

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'name', display: 'Keystore Name', type: 'string', isRequired: true },
        { name: 'password', display: 'Keystore Password', type: 'password', isRequired: true },
        { name: 'verifiedPassword', display: 'Verify Password', type: 'verified-password', isRequired: true }
    ]);

    const handleFormSubmit = () => {
        // Generate the new keystore for the user

        dispatch(VAULT_ACTIONS.generateNewSecureHDVault(seedPhrase, formState.password.value, desiredCurve))
        history.push("/hub");
    }

    console.log(formState);

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

                <Grid.Column width={16} className="p-0 self-center flex flex-col items-center" >

                    <GenerateKeystoreForm hideTitle />

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default CreateAKeystore;