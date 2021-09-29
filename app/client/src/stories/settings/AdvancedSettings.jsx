import React from 'react';

import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useFormState } from 'hooks/_hooks';

import { VAULT_ACTIONS } from 'redux/actions/_actions'

import Page from '../../layout/Page';

function AdvancedSettings() {

    const history = useHistory();
    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Advanced Settings" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center text-sm">

                    <p>Please select a password to secure your keystore and act as a general administration password.</p>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 self-center">

                    <Container className="flex flex-col justify-center text-justify w-72">

                        <Button color="orange" basic content="Go Back" className="m-0 w-72" onClick={() => history.goBack()}/>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default AdvancedSettings;