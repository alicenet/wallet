import React from 'react';

import { Form, Grid, Header } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormState } from 'hooks/_hooks';

import GenerateKeystoreForm from 'components/keystore/GenerateKeystoreForm';

import { ADAPTER_ACTIONS, VAULT_ACTIONS } from 'redux/actions/_actions'

import Page from 'layout/Page';

function CreateAKeystore() {

    const history = useHistory();
    const dispatch = useDispatch();

    const [keystore, setKeystore] = React.useState(false); // [newKeystore, password]
    const [loadError, setLoadError] = React.useState(false);

    const [formState, formSetter] = useFormState([
        { name: 'name', display: 'Keystore Name', type: 'string', isRequired: true },
    ]);

    const handleKeystoreLoad = (keystore, password) => {
        // The load form will call this on success with keystore and used password
        // Set state for name check on this keystore.
        setKeystore([keystore, password]);
    }

    const dispatchWalletUpdate = async () => {

        if (formState.name.value.length < 3) {
            return setLoadError("Should be at least 3 characters.")
        }

        let loaded = await dispatch(VAULT_ACTIONS.addExternalWalletToState(keystore[0], keystore[1], formState.name.value));
        // Force a manual network connection on a newly generated wallet
        await dispatch(ADAPTER_ACTIONS.initAdapters())

        if (loaded.error) {
            setLoadError(loaded.error);
        }
        history.push('/hub');
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0 w-full">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Create A Keystore" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={16} className="p-0 text-sm self-center">

                    {keystore ? (<div className="flex flex-col items-center justify-center">

                        <p>Alright, this is the last step! </p>
                        <p>We just need a name to reference this keystore by</p>

                        <Form size="mini" className="w-60 mt-12">
                            <Form.Input
                                className="text-left"
                                value={formState.name.value}
                                onChange={e => formSetter.setName(e.target.value)}
                                label="Wallet Name"
                                placeholder="My New Keystore"
                                error={!!loadError && { content: loadError }}
                            />
                            <Form.Button color="green" basic content="Confirm Name" className="mt-16" fluid onClick={dispatchWalletUpdate}/>
                        </Form>


                    </div>) : (
                        <>

                            <p>Please select a password to secure your keystore and act as a general administration password.</p>

                            <p>The keystore password will be used to lock your keystore. You will need it to load this wallet again.</p>

                            <p>The administrative password is used for general administrative tasks.</p>

                        </>
                    )}


                </Grid.Column>

                <Grid.Column width={16} className="flex justify-center items-center self-center">

                    <div className="flex flex-col items-center w-full">
                        {!keystore && (
                            <GenerateKeystoreForm
                                cancelText="Go Back"
                                cancelFunction={history.goBack}
                                submitText={"Load This Keystore"}
                                submitFunction={handleKeystoreLoad}
                                hideTitle/>
                        )}
                    </div>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default CreateAKeystore;