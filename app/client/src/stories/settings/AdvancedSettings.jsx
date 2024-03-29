import React from 'react';

import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';

import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

import Page from 'layout/Page';
import { useFormState } from 'hooks/_hooks';
import { ADAPTER_ACTIONS, CONFIG_ACTIONS, INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { initialConfigurationState } from 'redux/reducers/configuration'; // <= We can import this to use as a local setter
import { SyncToastMessageSuccess, SyncToastMessageWarning } from 'components/customToasts/CustomToasts';

function AdvancedSettings() {

    const history = useHistory();
    const dispatch = useDispatch();

    const { aliceNetProvider, ethereumProvider, registryContractAddress, loading } = useSelector(state => ({
        aliceNetProvider: state.config.alice_net_provider,
        ethereumProvider: state.config.ethereum_provider,
        registryContractAddress: state.config.registry_contract_address,
        loading: state.interface.globalLoading,
    }));

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'AliceNetProvider', display: 'AliceNet Provider', type: 'url', isRequired: true, value: aliceNetProvider },
        { name: 'EthereumProvider', display: 'Ethereum Provider', type: 'url', isRequired: true, value: ethereumProvider },
        { name: 'RegistryContractAddress', display: 'Registry Contract Address', type: 'address', isRequired: true, value: registryContractAddress }
    ]);

    const handleSubmit = async () => {
        toast.dismiss(); // Dismiss previous toasts before retrying

        dispatch(INTERFACE_ACTIONS.toggleGlobalLoadingBool(true));
        const result = await dispatch(CONFIG_ACTIONS.saveConfigurationValues({
            aliceNetProvider: formState.AliceNetProvider.value,
            ethProvider: formState.EthereumProvider.value,
            registryContractAddress: formState.RegistryContractAddress.value
        }));

        if (result.error) {
            notifyError('There was an error while saving changes');
        }
        else {
            notifySuccess('Settings were updated');
            // Dispatch an init, to retry connections if not connected
            dispatch(ADAPTER_ACTIONS.initAdapters());
        }
    };

    const notifyError = message => {
        toast.error(<SyncToastMessageWarning title="Error" message={message} />, { autoClose: 2000 });
        dispatch(INTERFACE_ACTIONS.toggleGlobalLoadingBool(false));
    };

    const notifySuccess = message => {
        toast.success(<SyncToastMessageSuccess title="Success" message={message} />, { autoClose: 1000 });
        dispatch(INTERFACE_ACTIONS.toggleGlobalLoadingBool(false));
    };

    // Instead, we can pull in the default values from the context and use it as a local setter, and propagate those changes upwards to redux
    const handleLoadDefaultValues = async () => {
        formSetter.setAliceNetProvider(initialConfigurationState.alice_net_provider);
        formSetter.setEthereumProvider(initialConfigurationState.ethereum_provider);
        formSetter.setRegistryContractAddress(initialConfigurationState.registry_contract_address);

        dispatch(INTERFACE_ACTIONS.toggleGlobalLoadingBool(true));
        await dispatch(CONFIG_ACTIONS.loadDefaultValues());

        notifySuccess('Default values loaded');
        dispatch(ADAPTER_ACTIONS.initAdapters());
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0 content-evenly">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Advanced Settings" as="h3" className="m-0" />

                </Grid.Column>

                <Grid.Column width={12} className="self-center p-0 m-0 text-left">

                    <Form className="text-sm">

                        <Form.Input
                            id="aliceNetProvider"
                            label="AliceNet Provider"
                            placeholder="Enter AliceNet Provider"
                            required
                            value={formState.AliceNetProvider.value}
                            onChange={e => formSetter.setAliceNetProvider(e.target.value)}
                            error={!!formState.AliceNetProvider.error && { content: formState.AliceNetProvider.error }}
                        />

                        <Form.Input
                            id="ethereumProvider"
                            label="Ethereum Provider"
                            placeholder="Enter Ethereum Provider"
                            required
                            value={formState.EthereumProvider.value}
                            onChange={e => formSetter.setEthereumProvider(e.target.value)}
                            error={!!formState.EthereumProvider.error && { content: formState.EthereumProvider.error }}
                        />

                        <Form.Input
                            id="registryContractAddress"
                            label="Registry Contract Address"
                            placeholder="Enter Address"
                            required
                            value={formState.RegistryContractAddress.value}
                            onChange={e => formSetter.setRegistryContractAddress(e.target.value)}
                            error={!!formState.RegistryContractAddress.error && { content: formState.RegistryContractAddress.error }}
                        />

                    </Form>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <div>

                            <Button color="black" basic content="Go Back" onClick={history.goBack} />

                        </div>

                        <div className="flex flex-col gap-2">

                            <Button.Group>

                                <Button
                                    disabled={loading}
                                    color="teal"
                                    icon="save"
                                    content="Save"
                                    onClick={() => onSubmit(handleSubmit)}
                                />

                                <Button.Or className="w-0 self-center text-sm" />

                                <Button
                                    disabled={loading}
                                    color="teal"
                                    icon="undo alternate"
                                    content="Load Defaults"
                                    onClick={handleLoadDefaultValues}
                                />

                            </Button.Group>

                        </div>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default AdvancedSettings;