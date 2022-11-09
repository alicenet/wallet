import React, { useEffect, useState } from "react";
import { Container, Grid, Header, Message } from "semantic-ui-react";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import GenerateKeystoreForm from "components/keystore/GenerateKeystoreForm";
import Page from "layout/Page";
import { VAULT_ACTIONS } from "redux/actions/_actions";
import { default_log as log } from "log/logHelper";

export default function GenerateKeystore() {
    const history = useHistory();
    const dispatch = useDispatch();

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [results, setResult] = useState(false);

    const loadKeystore = async (results, password, name) => {
        if (results.error) {
            return;
        } // Error handled internally of form
        else {
            let added = await dispatch(
                VAULT_ACTIONS.addExternalWalletToState(results, password, name)
            );
            if (added.error) {
                log.error(added.error);
                return setError(added.error);
            }
            setResult(results);
            setSuccess(true);
        }
    };

    useEffect(() => {
        if (success) {
            history.push("/hub", {
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
                            Generate Keystore
                        </Header>
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
                                <Message
                                    success
                                    content="Keystore loaded"
                                    size="mini"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="absolute -bottom-16 inset-center">
                                <Message error content={error} size="mini" />
                            </div>
                        )}
                    </Grid.Column>
                </Grid>
            </Container>
        </Page>
    );
}
