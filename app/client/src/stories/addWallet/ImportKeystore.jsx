import React, { useEffect, useState } from "react";
import { Container, Grid, Header, Message } from "semantic-ui-react";
import { useHistory } from "react-router-dom";

import LoadKeystoreForm from "components/keystore/LoadKeystoreForm";
import Page from "layout/Page";

export default function ImportKeystore() {
    const history = useHistory();

    const [success, setSuccess] = useState(false);
    const [results, setResult] = useState(false);

    const addWallet = async (results) => {
        if (results.error) {
            return;
        } // Error handled internally of form
        else {
            setResult(results);
            setSuccess(true);
        }
    };

    useEffect(() => {
        if (success) {
            history.push("/addWallet/verify", {
                toLoad: results,
            });
        }
    }, [success, results, history]);

    return (
        <Page showNetworkStatus>
            <Container
                fluid
                className="h-full flex items-center justify-center"
            >
                <Grid textAlign="center">
                    <Grid.Column width={16}>
                        <Header className="text-gray-500 mb-8">
                            Import Keystore
                        </Header>

                        <div className="text-sm">
                            <p>
                                Import an existing wallet from an ethereum
                                keystore.
                            </p>
                        </div>
                    </Grid.Column>

                    <Grid.Column width={16} textAlign="center">
                        <div className="flex justify-center">
                            <LoadKeystoreForm
                                hideTitle
                                submitFunction={addWallet}
                                cancelText="Cancel"
                                cancelFunction={history.goBack}
                            />
                        </div>

                        {success && (
                            <div className="absolute -bottom-16 inset-center">
                                <Message
                                    success
                                    content="Wallet successfully parsed, please wait..."
                                    size="mini"
                                />
                            </div>
                        )}
                    </Grid.Column>
                </Grid>
            </Container>
        </Page>
    );
}
