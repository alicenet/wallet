import React from 'react';

import { Button, Container, Form, Grid, Header } from 'semantic-ui-react';

import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import Page from '../../layout/Page';
import { useFormState } from '../../hooks/_hooks';
import { CONFIG_ACTIONS } from '../../redux/actions/_actions';

function AdvancedSettings() {

    const history = useHistory();
    const dispatch = useDispatch();

    const { madNetChainId, madNetProvider, ethereumProvider, registryContractAddress } = useSelector(state => ({
        madNetChainId: state.config.mad_net_chainID,
        madNetProvider: state.config.mad_net_provider,
        ethereumProvider: state.config.ethereum_provider,
        registryContractAddress: state.config.registry_contract_address,
    }));

    const [formState, formSetter] = useFormState(["MadNetChainId", "MadNetProvider", "EthereumProvider", "RegistryContractAddress"]);

    React.useEffect(() => {
        formSetter.setMadNetChainId(madNetChainId);
        formSetter.setMadNetProvider(madNetProvider);
        formSetter.setEthereumProvider(ethereumProvider);
        formSetter.setRegistryContractAddress(registryContractAddress);
    }, [madNetChainId, madNetProvider, ethereumProvider, registryContractAddress]);

    const handleFormSubmit = () => {
        if (!formState.MadNetChainId.value) {
            return formSetter.setMadNetChainIdError("MadNet ChainID is required");
        }
        else {
            formSetter.clearMadNetChainIdError()
        }
    }

    const handleLoadDefaultValues = () => {
        dispatch(CONFIG_ACTIONS.loadDefaultValues())
    }

    return (
        <Page>

            <Grid textAlign="center" className="m-0">

                <Grid.Column width={16} className="p-0 self-center">

                    <Header content="Advanced Settings" as="h3" className="m-0"/>

                </Grid.Column>

                <Grid.Column width={8} className="p-0 self-center">

                    <Form onSubmit={(event => handleFormSubmit(event))}>

                        <Form.Group className="flex flex-auto flex-col m-0 text-left text-sm gap-5">

                            <Form.Input
                                id='madNetChainId'
                                label='MadNet ChainID'
                                placeholder='Enter MadNet ChainID'
                                required
                                value={formState.MadNetChainId.value}
                                onChange={e => {
                                    formSetter.setMadNetChainId(e.target.value)
                                }}
                                error={!!formState.MadNetChainId.error && {
                                    content: formState.MadNetChainId.error
                                }}
                            />

                            <Form.Input
                                id='madNetProvider'
                                label='MadNet Provider'
                                placeholder='Enter MadNet Provider'
                                required
                                value={formState.MadNetProvider.value}
                                onChange={e => {
                                    formSetter.setMadNetProvider(e.target.value)
                                }}
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
                                onChange={e => {
                                    formSetter.setEthereumProvider(e.target.value)
                                }}
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
                                onChange={e => {
                                    formSetter.setRegistryContractAddress(e.target.value)
                                }}
                                error={!!formState.RegistryContractAddress.error && {
                                    content: formState.RegistryContractAddress.error
                                }}
                            />

                        </Form.Group>

                    </Form>

                </Grid.Column>

                <Grid.Column width={12} className="p-0 self-center">

                    <Container className="flex justify-between">

                        <div>

                            <Button color="orange" basic content="Go Back" className="m-0" onClick={() => history.goBack()}/>

                        </div>

                        <div className="flex flex-col gap-2">

                            <Button.Group size='large'>

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