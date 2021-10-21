import React from 'react';
import { Container, Grid, Header, Button, Form, Message, Loader } from 'semantic-ui-react'
import { useHistory } from 'react-router';
import useFormState, { fieldType } from 'hooks/useFormState';
import { useDispatch } from 'react-redux';
import { VAULT_ACTIONS } from 'redux/actions/_actions';
import { default_log as log } from 'log/logHelper';
import LoadKeystoreForm from 'components/keystore/LoadKeystoreForm';

import MadWalletJs from 'madwalletjs';
import { walletUtils } from 'util/_util';
import { curveTypes } from 'util/wallet';

export default function VerifyImport() {

    const history = useHistory();
    const dispatch = useDispatch();
    // Forwarded state
    const toLoad = history?.location?.state?.toLoad;
    const isKeystore = history?.location?.state?.isKeystore;
    // Local State
    const [potentialWallet, setPotentialWallet] = React.useState(false);
    const [loading, setLoading] = React.useState('address');
    const [success, setSuccess] = React.useState(false);
    const [error, setError] = React.useState(false);

    // If state doesn't exist, push the user back to the addWalletsMenu
    React.useEffect(() => {
        if (!toLoad) {
            history.push('/addWallet/menu')
        }
    })

    // Use an empty MadNetWalletJS Instance to extract potential wallet information
    React.useEffect(() => {

        const getPotentialWallet = async () => {
            // Create temp instance
            let tempMadWallet = new MadWalletJs();
            try {
                // Unlock the passed keystore to add
                let ks = walletUtils.unlockKeystore(toLoad.locked, toLoad.password);
                await tempMadWallet.Account.addAccount(ks.privateKey, ks.curve ? ks.curve : curveTypes.SECP256K1); // Default to secp
                setPotentialWallet(tempMadWallet.Account.accounts[0]);
                setLoading(false);
            } catch (ex) {
                log.error(ex);
                setError("Unable to load and parse wallet, check log.")
            }
        }

        getPotentialWallet();

    }, [])

    React.useEffect(() => {
        if (success) {
            history.push('/hub')
        }
    }, [success])

    const verify = async () => {
        setLoading("verifying");

        let added = await dispatch(VAULT_ACTIONS.addExternalWalletToState(toLoad.locked, toLoad.password, toLoad.walletName));

        if (added.error) {
            log.error(added.error);
            setLoading(false);
            return setError(added.error);
        }

        setError(false);
        setSuccess(true);
    }

    return (

        <Container fluid className="h-full flex items-center justify-center">

            <Grid textAlign="center">

                <Grid.Column width={16} className="mb-8">

                    <Header className="text-gray-500 mb-8">Verify Import</Header>

                    <div className="text-sm">

                        <p>Please verify that the below address is the expected public address.</p>

                        <p>If it is not please cancel, and import with a different curve.</p>

                    </div>

                </Grid.Column>

                <Grid.Column width={16} className="flex flex-auto flex-col items-center">

                    <div className="flex flex-row items-center">
                        <span className="font-bold uppercase">Public Address: &nbsp; </span> {loading === "address" ? <Loader className="ml-4 " inline active size="mini" /> : potentialWallet.address}
                    </div>

                </Grid.Column>

                <Grid.Column width={16} className="flex flex-auto flex-col items-center mt-8">

                    <div className="flex flex-col gap-2 w-72">
                        <Button loading={loading === "verifying"} content={error ? "Try Again" : "Verify Import"} basic color={error ? "red" : "green"} size="small" onClick={verify} />
                        <Button content="Cancel" onClick={() => history.push('/addWallet/menu')} basic color="orange" size="small" />
                    </div>

                    {error && (
                        <div className="absolute -bottom-16 inset-center">
                            <Message error content={error} size="mini" />
                        </div>
                    )}


                </Grid.Column>

            </Grid>

        </Container>

    )

}