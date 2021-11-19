import React from 'react';
import { Container, Grid, Header, Button, Form, Message } from 'semantic-ui-react'
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { VAULT_ACTIONS } from 'redux/actions/_actions';
import { default_log as log } from 'log/logHelper';

export default function AddWalletMenu() {

    const history = useHistory();
    const dispatch = useDispatch();

    const [loading, setLoading] = React.useState(false);

    const [walletName, setWalletName] = React.useState({ value: "", error: "" });
    const setWalletNameKeys = (obj) => setWalletName(s => ({ ...s, ...obj }));

    const [walletAdded, setWalletAdded] = React.useState({ value: "", error: "" });
    const setWalletAddedKeys = (obj) => setWalletAdded(s => ({ ...s, ...obj }));

    const genWallet = async () => {

        setLoading(true);
        let error = false;

        if (typeof walletName.value !== 'string') {
            error = "Must be a string"
        }
        if (walletName.value.length <= 3) {
            error = "Must be at least 4 characters"
        }
        
        if (error) {
            setLoading(false);
            return setWalletNameKeys({ "error": "Must be at least 4 characters" });
        }

        // Clear Error
        setWalletNameKeys({ "error": "" });

        // Falsify wait for UI
        setTimeout(async () => {
            // Attempt to add the HD Wallet
            let added = await dispatch(VAULT_ACTIONS.addInternalWalletToState(walletName.value));
            setLoading(false);
            if (added.error) {
                log.error(added.error);
                return setWalletAddedKeys({ "error": "Unable to generate new wallet. Please check logs." });
            }
            setWalletAddedKeys({ "value": true, "error": "" });
        }, 1000)

    }

    React.useEffect(() => {
        if (walletAdded.value === true) {
            setTimeout(() => {
                history.push("/hub");
            }, 1450)
        }
    }, [walletAdded, history])

    return (

        <Container fluid className="h-full flex items-center justify-center">

            <Grid textAlign="center">

                <Grid.Column width={16} className="mb-8">

                    <Header className="text-gray-500 mb-8">Generate New Wallet</Header>

                    <div className="text-sm">

                        <p>Generated wallets are considered internal wallets.</p>

                        <p>Internal wallets are generated through the seed phrase already provided.</p>

                    </div>

                </Grid.Column>

                <Grid.Column width={16} textAlign="center">

                    <div className="flex justify-center h-28">
                        <Form className="w-56" size="small">
                            <Form.Input value={walletName.value} onChange={e => setWalletNameKeys({ value: e.target.value })}
                                error={!!walletName.error && walletName.error}
                                label="Wallet Name" size="small"
                                className="text-left"
                            />
                        </Form>
                    </div>

                </Grid.Column>

                <Grid.Column width={16} textAlign="center" className="mt-6">

                    <div className="flex flex-col gap-4 items-center">
                        <Button basic className="w-52" size="small" loading={loading}
                            onClick={genWallet}
                            color={walletAdded.error ? "red" : "green"}
                            disabled={!!walletAdded.value}
                            content={walletAdded.error ? "Try Again" : !!walletAdded.value ? "Success" : "Add Wallet"}
                            icon={walletAdded.error ? "exclamation" : !!walletAdded.value ? "checkmark" : "plus"}
                        />
                        <Button basic loading={!!walletAdded.value} content="Cancel" className="w-52" size="small"
                            icon={!!walletAdded.value ? "thumbs up" : "x"}
                            color={!!walletAdded.value ? "green" : "orange"}
                            onClick={!!walletAdded.value ? null : history.goBack}
                        />
                    </div>

                    {!!walletAdded.value && (
                        <div className="absolute -bottom-16 inset-center">
                            <Message success content="Wallet successfully added, please wait. . ." size="mini" />
                        </div>
                    )}

                    {!!walletAdded.error && (
                        <div className="absolute -bottom-16 inset-center">
                            <Message error content={walletAdded.error} size="mini" />
                        </div>
                    )}

                </Grid.Column>

            </Grid>

        </Container>

    )

}