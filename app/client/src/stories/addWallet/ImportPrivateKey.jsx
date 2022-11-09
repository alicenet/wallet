import React, { useEffect, useState } from "react";
import { Container, Grid, Header, Message } from "semantic-ui-react";
import { useHistory } from "react-router-dom";

import ImportPrivateKeyForm from "components/keystore/ImportPrivateKeyForm";
import Page from "layout/Page";

export default function ImportPrivateKey() {
    const history = useHistory();

    const [success, setSuccess] = useState(false);
    const [results, setResult] = useState(false);

    const addWallet = async (results) => {
        setResult(results);
        setSuccess(true);
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
                            Import Private Key
                        </Header>

                        <div className="text-sm">
                            <p>
                                If your key was used with a BN Curve derived
                                public address, tick the box accordingly.
                            </p>
                        </div>
                    </Grid.Column>

                    <Grid.Column width={16} textAlign="center">
                        <div className="flex justify-center">
                            <ImportPrivateKeyForm
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
                                    content="Wallet successfully parsed, please wait. . ."
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
