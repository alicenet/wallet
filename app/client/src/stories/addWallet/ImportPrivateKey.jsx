import React from 'react';
import { Container, Grid, Header, Message } from 'semantic-ui-react'
import { useHistory } from 'react-router-dom';
import ImportPrivateKeyForm from 'components/keystore/ImportPrivateKeyForm';

export default function ImportPrivateKey() {

    const history = useHistory();

    const [success, setSuccces] = React.useState(false);
    const [results, setResult] = React.useState(false);

    const addWallet = async (results) => {
        setResult(results);
        setSuccces(true);
    }

    React.useEffect(() => {
        if (success) {
            history.push("/addWallet/verify", {
                toLoad: results,
            })
        }
    }, [success, results, history])

    return (

        <Container fluid className="h-full flex items-center justify-center">

            <Grid textAlign="center">

                <Grid.Column width={16}>

                    <Header className="text-gray-500 mb-8">Import Private Key</Header>

                    <div className="text-sm">

                        <p>If your key was used with a BN Curve derrived public address, tick the box accordingly.</p>

                    </div>

                </Grid.Column>

                <Grid.Column width={16} textAlign="center">

                    <div className="flex justify-center">
                        <ImportPrivateKeyForm hideTitle
                            submitText="Add Wallet"
                            submitFunction={addWallet}
                            cancelText="Cancel"
                            cancelFunction={history.goBack}
                        />
                    </div>

                    {success && (
                        <div className="absolute -bottom-16 inset-center">
                            <Message success content="Wallet successfully parsed, please wait. . ." size="mini" />
                        </div>
                    )}


                </Grid.Column>

            </Grid>

        </Container>

    )

}