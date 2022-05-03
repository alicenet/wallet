import React, { useEffect, useState } from 'react';
import { Button, Container, Grid, Header, Loader, Message } from 'semantic-ui-react'
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { VAULT_ACTIONS } from 'redux/actions/_actions';
import { default_log as log } from 'log/logHelper';

import MadWalletJs from 'alicenetjs';
import utils, { walletUtils } from 'util/_util';
import { curveTypes } from 'util/wallet';
import Page from 'layout/Page';

export default function VerifyImport() {

    const history = useHistory();
    const dispatch = useDispatch();
    // Forwarded state
    const toLoad = history?.location?.state?.toLoad;
    // Local State
    const [potentialWallet, setPotentialWallet] = useState(false);

    const [addressLoading, setAddressLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    // If state doesn't exist, push the user back to the addWalletsMenu
    useEffect(() => {
        if (!toLoad) {
            history.push('/addWallet/menu')
        }
    }, [history, toLoad])

    // Use an empty MadNetWalletJS Instance to extract potential wallet information
    useEffect(() => {

        const getPotentialWallet = async () => {
            // Create temp instance
            let tempMadWallet = new MadWalletJs();
            try {
                // Unlock the passed keystore to add
                let ks = walletUtils.unlockKeystore(toLoad.locked, toLoad.password);
                await tempMadWallet.Account.addAccount(ks.privateKey, ks.curve ? ks.curve : curveTypes.SECP256K1); // Default to secp
                setPotentialWallet(tempMadWallet.Account.accounts[0]);
                setAddressLoading(false);
            } catch (ex) {
                log.error(ex);
                setError("Unable to load and parse wallet, check log.")
            }
        }

        getPotentialWallet();

    }, []) //eslint-disable-line

    React.useEffect(() => {
        if (success) {
            history.push('/hub')
        }
    }, [success, history])

    const verify = async () => {
        setVerifyLoading(true);
        
        await utils.generic.waitFor(0); // See ImportPrivateKey.jsx comment for why this works.
        let added = await dispatch(VAULT_ACTIONS.addExternalWalletToState(toLoad.locked, toLoad.password, toLoad.walletName));

        setVerifyLoading(false);

        if (added.error) {
            log.error(added.error);
            return setError(added.error);
        }

        setError(false);
        setSuccess(true);
    }

    return (
        <Page showNetworkStatus>

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
                            <span className="font-bold uppercase">Public Address: &nbsp; </span> {addressLoading ?
                            <Loader className="ml-4" inline active size="mini"/> : potentialWallet.address}
                        </div>

                    </Grid.Column>

                    <Grid.Column width={16} className="flex flex-auto flex-col items-center mt-8">

                        <div className="flex flex-col gap-2 w-72">
                            <Button
                                loading={verifyLoading}
                                content={error ? "Try Again" : "Verify Import"}
                                basic
                                color={error ? "red" : "green"}
                                size="small"
                                onClick={verify}
                            />
                            <Button
                                content="Cancel"
                                onClick={() => history.push('/addWallet/menu')}
                                basic
                                color="orange"
                                size="small"
                            />
                        </div>

                        {error && (
                            <div className="absolute -bottom-16 inset-center">
                                <Message error content={error} size="mini"/>
                            </div>
                        )}

                    </Grid.Column>

                </Grid>

            </Container>

        </Page>
    )

}