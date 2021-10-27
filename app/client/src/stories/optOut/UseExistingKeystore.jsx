import React from 'react';

import { Grid, Header } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';

import LoadKeystoreForm from 'components/keystore/LoadKeystoreForm';
import { useDispatch } from 'react-redux';

import Page from 'layout/Page';
import { toast } from 'react-toastify';

import { VAULT_ACTIONS, ADAPTER_ACTIONS } from 'redux/actions/_actions';

function UseExistingKeystore() {

    const history = useHistory();
    const dispatch = useDispatch();

    const handleLoad = async (results) => {

        let loaded = await dispatch(VAULT_ACTIONS.addExternalWalletToState(results.locked, results.password, results.walletName));
        // Force a manual network connection on a newly generated wallet

        // Errors are primarily handled in the form before reaching this state, 
        // If something bubbles this high, it is severe.
        if (loaded.error) {
            return toast.error("A serious error has occurred, please restart the application and try again.");
        }

        await dispatch(ADAPTER_ACTIONS.initAdapters())
        history.push('/hub');
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0 w-full">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Use Existing Keystore" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={16} className="p-0 text-sm">

                    <p>Please choose an existing keystore file to load.</p>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 flex justify-center" textAlign="center">

                    <LoadKeystoreForm
                        hideTitle
                        submitText="Load Keystore"
                        submitFunction={handleLoad}
                        cancelText="Go Back"
                        cancelFunction={history.goBack}
                    />

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default UseExistingKeystore;