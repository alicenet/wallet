import React from 'react';

import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';

import Page from 'layout/Page';
import { useFormState } from 'hooks/_hooks';
import { CONFIG_ACTIONS } from 'redux/actions/_actions';
import { initialConfigurationState } from 'redux/reducers/configuration'; // <= We can import this to use as a local setter
import utils from 'util/_util';

function AdvancedSettings() {

    const history = useHistory();
    const dispatch = useDispatch();

    const { madNetChainId, madNetProvider, ethereumProvider, registryContractAddress } = useSelector(state => ({
        madNetChainId: state.config.mad_net_chainID,
        madNetProvider: state.config.mad_net_provider,
        ethereumProvider: state.config.ethereum_provider,
        registryContractAddress: state.config.registry_contract_address,
    }));

    // This is a local state change, and is not propagated to the store
    const [formState, formSetter] = useFormState(["MadNetChainId", "MadNetProvider", "EthereumProvider", "RegistryContractAddress"]);

    // This actually won't run because the context equality check passes ( We never update it, it stays the same )
    React.useEffect(() => {
        formSetter.setMadNetChainId(madNetChainId);
        formSetter.setMadNetProvider(madNetProvider);
        formSetter.setEthereumProvider(ethereumProvider);
        formSetter.setRegistryContractAddress(registryContractAddress);
    }, [madNetChainId, madNetProvider, ethereumProvider, registryContractAddress]); // <= These didn't change so this effect didnt't run.
    // Technically you could use [] here since you only care about the defaults on initial mount, but you would need to ignore the linter

    const handleFormSubmit = () => {

        if (!formState.MadNetChainId.value || (formState.MadNetChainId.value.trim && formState.MadNetChainId.value.trim() === "")) {
            formSetter.setMadNetChainIdError("MadNet ChainID is required");
        }
        else if (isNaN(formState.MadNetChainId.value)) {
            formSetter.setMadNetChainIdError("MadNet ChainID is not a valid number");
        }
        else {
            formSetter.clearMadNetChainIdError();
        }

        if (!formState.MadNetProvider.value) {
            formSetter.setMadNetProviderError("MadNet Provider is required");
        }
        else if (!utils.string.isValidHttpUrl(formState.MadNetProvider.value)) {
            formSetter.setMadNetProviderError("MadNet Provider is not a valid HTTP url");
        }
        else {
            formSetter.clearMadNetProviderError();
        }

        if (!formState.EthereumProvider.value) {
            formSetter.setEthereumProviderError("Ethereum Provider is required");
        }
        else if (!utils.string.isValidHttpUrl(formState.EthereumProvider.value)) {
            formSetter.setEthereumProviderError("Ethereum Provider is not a valid HTTP url");
        }
        else {
            formSetter.clearEthereumProviderError();
        }

        if (!formState.RegistryContractAddress.value) {
            formSetter.setRegistryContractAddressError("Registry Contract Address is required");
        }
        else if (!Web3.utils.isAddress(formState.RegistryContractAddress.value)) {
            formSetter.setRegistryContractAddressError("Registry Contract Address is not a valid address");
        }
        else {
            formSetter.clearRegistryContractAddressError();
        }

        if (!formState.MadNetChainId.error
            && !formState.MadNetProvider.error
            && !formState.EthereumProvider.error
            && !formState.RegistryContractAddress.error) {
            // Propagate save to redux state
            saveValues();
        }
    }

    // In this function we can propagate the save upwards to the redux state -- Treat redux as truth and the local state as the editing playground
    const saveValues = () => {
        console.log("SAVE VALUES")
        console.log(formState);
        dispatch(CONFIG_ACTIONS.saveConfigurationValues(
            formState.MadNetChainId.value,
            formState.MadNetProvider.value,
            formState.EthereumProvider.value,
            formState.RegistryContractAddress.value
        ));
    }

    // Instead we can pull in the default values from the context and use it as a local setter, and propagate those chnages upwards to redux
    const handleLoadDefaultValues = () => {
        dispatch(CONFIG_ACTIONS.loadDefaultValues()) // This call *does* update the redux state, but the local state isn't being bubbled to as we never update this state
        formSetter.setMadNetChainId(initialConfigurationState.mad_net_chainID);
        formSetter.setMadNetProvider(initialConfigurationState.mad_net_provider);
        formSetter.setEthereumProvider(initialConfigurationState.ethereum_provider);
        formSetter.setRegistryContractAddress(initialConfigurationState.registry_contract_address);
    }

    return (
        <Page hideMenu>

            <Grid textAlign="center" className="m-0 content-evenly">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Advanced Settings" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={12} className="self-center p-0 m-0 text-left">

                    <Form onSubmit={(event => handleFormSubmit(event))} className="text-sm">

                        <Form.Input
                            id='madNetChainId'
                            label='MadNet ChainID'
                            placeholder='Enter MadNet ChainID'
                            required
                            value={formState.MadNetChainId.value}
                            onChange={e => formSetter.setMadNetChainId(e.target.value)}
                            error={!!formState.MadNetChainId.error && { content: formState.MadNetChainId.error }}
                        />

                        <Form.Input
                            id='madNetProvider'
                            label='MadNet Provider'
                            placeholder='Enter MadNet Provider'
                            required
                            value={formState.MadNetProvider.value}
                            onChange={e => formSetter.setMadNetProvider(e.target.value)}
                            error={!!formState.MadNetProvider.error && {
                                content: formState.MadNetProvider.error
                            }}
                        />

                        <Form.Input
                            id='ethereumProvider'
                            label='Ethereum Provider'
                            placeholder='Enter Ethereum Provider'
                            required
                            value={formState.EthereumProvider.value}
                            onChange={e => formSetter.setEthereumProvider(e.target.value)}
                            error={!!formState.EthereumProvider.error && {
                                content: formState.EthereumProvider.error
                            }}
                        />

                        <Form.Input
                            id='registryContractAddress'
                            label='Registry Contract Address'
                            placeholder='Enter Address'
                            required
                            value={formState.RegistryContractAddress.value}
                            onChange={e => formSetter.setRegistryContractAddress(e.target.value)}
                            error={!!formState.RegistryContractAddress.error && {
                                content: formState.RegistryContractAddress.error
                            }}
                        />

                    </Form>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <div>

                            <Button color="orange" basic content="Go Back" className="m-0" onClick={() => history.goBack()}/>

                        </div>

                        <div className="flex flex-col gap-2">

                            <Button.Group>

                                <Button color="purple" icon="save" basic content="Save" className="m-0" onClick={handleFormSubmit}/>

                                <Button.Or className="w-0 self-center text-sm"/>

                                <Button color="purple" icon="undo alternate" basic content="Load Defaults" className="m-0"
                                        onClick={handleLoadDefaultValues}/>

                            </Button.Group>

                        </div>

                    </Container>

                </Grid.Column>

            </Grid>

        </Page>
    )

}

export default AdvancedSettings;