import React from 'react';
import { Container, Grid, Header, Button, Form, Message } from 'semantic-ui-react'
import { useHistory } from 'react-router';
import useFormState, { fieldType } from 'hooks/useFormState';
import { useDispatch } from 'react-redux';
import { VAULT_ACTIONS } from 'redux/actions/_actions';
import { default_log as log } from 'log/logHelper';
import LoadKeystoreForm from 'components/keystore/LoadKeystoreForm';

export default function ImportKeystore() {

    const history = useHistory();
    const dispatch = useDispatch();

    const [loading, setLoading] = React.useState(false);
    const [success, setSuccces] = React.useState(false);
    const [error, setError] = React.useState(false);

    const addWallet = async (results) => {

        console.log(results)
        setLoading(true);

        let error = false;

        if (error) {
            setError(error);
            return setLoading(false);
        }

        // Clear Error
        setError(false);

        // Falsify wait for UI
        setTimeout(async () => {
            // Attempt to add the HD Wallet
            let added = {error: "yes"} // await dispatch(VAULT_ACTIONS.addExternalWalletToState());
            setLoading(false);
            if (added.error) {
                log.error(added.error);
                return setError("Unable to load keystore. Please check logs.");
            }
            setError(false);
            setSuccces(true);
        }, 1000)

    }

    React.useEffect(() => {
        if (success) {
            setTimeout(() => {
                history.push("/hub");
            }, 1450)
        }
    }, [success])

    return (

        <Container fluid className="h-full flex items-center justify-center">

            <Grid textAlign="center">

                <Grid.Column width={16}>

                    <Header className="text-gray-500 mb-8">Import Keystore</Header>

                    <div className="text-sm">

                        <p>Import an existing wallet from an ethereum keystore.</p>

                        <p>Make sure to tag the appropriate curve for this import.</p>

                    </div>

                </Grid.Column>

                <Grid.Column width={16} textAlign="center">

                    <div className="flex justify-center">
                        <LoadKeystoreForm hideTitle
                            submitText="Add Wallet"
                            submitFunction={addWallet}
                            cancelText="Cancel"
                            cancelFunction={history.goBack}
                        />
                    </div>

                    {success && (
                        <div className="absolute -bottom-16 inset-center">
                            <Message success content="Wallet successfully added, please wait. . ." size="mini" />
                        </div>
                    )}


                </Grid.Column>

            </Grid>

        </Container>

    )

}