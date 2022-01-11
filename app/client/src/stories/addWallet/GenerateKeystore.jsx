import React, { useState } from 'react';
import { Container, Grid, Header, Message } from 'semantic-ui-react'
import { useHistory } from 'react-router-dom';

import GenerateKeystoreForm from 'components/keystore/GenerateKeystoreForm';
import Page from 'layout/Page';

export default function GenerateKeystore() {

    const history = useHistory();

    const [success, setSuccess] = useState(false);

    const loadKeystore = async (results) => {
        if (results.error) { return } // Error handled internally of form
        else {
            setSuccess(true);
        }
    }

    return (
        <Page showNetworkStatus>

            <Container fluid className="h-full flex items-center justify-center">

                <Grid textAlign="center">

                    <Grid.Column width={16}>

                        <Header className="text-gray-500 mb-8">Generate Keystore</Header>

                    </Grid.Column>

                    <Grid.Column width={16} textAlign="center">

                        <div className="flex justify-center ">
                            <GenerateKeystoreForm
                                hideTitle
                                submitText="Load Keystore"
                                submitFunction={loadKeystore}
                                cancelText="Go Back"
                                cancelFunction={history.goBack}
                            />
                        </div>

                        {success && (
                            <div className="absolute -bottom-16 inset-center">
                                <Message success content="Keystore loaded" size="mini"/>
                            </div>
                        )}

                    </Grid.Column>

                </Grid>

            </Container>

        </Page>
    )

}