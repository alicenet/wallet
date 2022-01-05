import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { classNames } from 'util/_util';
import { Button, Form, Grid, Header, Icon, Modal } from 'semantic-ui-react';
import { toast } from "react-toastify";

import { SyncToastMessageSuccess, SyncToastMessageWarning } from 'components/customToasts/CustomToasts';
import { ADAPTER_ACTIONS, CONFIG_ACTIONS, INTERFACE_ACTIONS } from 'redux/actions/_actions';
import useFormState from 'hooks/useFormState';

export default function NetworkStatusIndicator() {

    const dispatch = useDispatch();

    const [openModal, setOpenModal] = useState(false);

    const { web3Connected, web3Error, web3Busy, madConnected, madError, madBusy, madNetProvider, ethereumProvider, registryContractAddress } = useSelector(s => ({
        web3Connected: s.adapter.web3Adapter.connected,
        web3Error: s.adapter.web3Adapter.error,
        web3Busy: s.adapter.web3Adapter.busy,

        madConnected: s.adapter.madNetAdapter.connected,
        madError: s.adapter.madNetAdapter.error,
        madBusy: s.adapter.madNetAdapter.busy,

        madNetProvider: s.config.mad_net_provider,
        ethereumProvider: s.config.ethereum_provider,
        registryContractAddress: s.config.registry_contract_address,
    }));

    const anyError = madError || web3Error;

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'MadNetProvider', display: 'MadNet Provider', type: 'url', isRequired: true, value: madNetProvider },
        { name: 'EthereumProvider', display: 'Ethereum Provider', type: 'url', isRequired: true, value: ethereumProvider },
        { name: 'RegistryContractAddress', display: 'Registry Contract Address', type: 'string', isRequired: true, value: registryContractAddress },
    ]);

    const handleClose = () => {
        setOpenModal(false);
    }

    // Catch possible registry contract errors
    let registryContractError = "";
    if (web3Error && web3Error.indexOf("Returned values aren't valid, did it run Out of Gas? You might also see this error if you are not using the correct ABI ") !== -1 ) {
        registryContractError = "Ethereum errors can related to the Registry Address, please verify it."
    }
    if (web3Error && web3Error.indexOf("is invalid, the capitalization checksum test failed") !== -1) {
        registryContractError = "Validate the above contract address."
    }

    const web3Color = web3Busy ? "yellow" : web3Connected ? "green" : "red";
    const madColor = madBusy ? "yellow" : madConnected ? "green" : "red";

    const handleSubmit = async () => {

        toast.dismiss(); // Dismiss previous toasts before retrying

        dispatch(INTERFACE_ACTIONS.toggleGlobalLoadingBool(true));
        const result = await dispatch(CONFIG_ACTIONS.saveConfigurationValues({
            madNetProvider: formState.MadNetProvider.value,
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

{/* <div className="flex flex-col absolute bottom-0 left-0 text-xs cursor-pointer bg-red-300 animate-pulse p-1" */}

    return (
        <Modal
            open={openModal}
            onClose={handleClose}
            size="small"
            trigger={
                <div className={classNames(
                    "group transition-all transition-slow ease hover:w-14 w-12 flex flex-col absolute bottom-0 left-0 text-xs cursor-pointer p-1 rounded-tr", 
                    {"" : anyError} )} 
                    onClick={() => setOpenModal(true)}
                >

                    <div className={classNames("flex items-center text-gray-600", {"animate-pulse text-red-600": madError})}>
                        <div className="font-bold font-mono">
                            MAD
                        </div>
                        <div className="relative" style={{ top: "-1px", marginLeft: "4px" }}>
                            <StatusLight color={madColor} />
                        </div>
                    </div>

                    <div className={classNames("flex items-center text-gray-600", {"animate-pulse text-red-600": web3Error})}>
                        <div className="font-bold font-mono">
                            ETH
                        </div>
                        <div className="relative" style={{ top: "-1px", marginLeft: "4px" }}>
                            <StatusLight color={web3Color} />
                        </div>
                    </div>

                </div>
            }
        >

            <Modal.Header className="text-center">

                <Header as="h4" className="uppercase" color="purple">Network Connection Status</Header>

            </Modal.Header>

            <Modal.Content className="flex flex-col text-xs">

                <Grid textAlign="center" className="m-0 content-evenly">

                    <Grid.Column width={12} className="self-center p-0 m-0 text-left">

                        <Form className="text-sm">

                            <Form.Input
                                id='madNetProvider'
                                label={
                                    <div className="flex items-center">
                                        <div className="font-bold">
                                            Madnet Provider
                                        </div>
                                        <div className="relative" style={{ top: "-1px", marginLeft: "4px" }}>
                                            <StatusLight color={madColor} />
                                        </div>
                                    </div>
                                }
                                disabled={madBusy}
                                placeholder='Enter MadNet Provider'
                                required
                                value={formState.MadNetProvider.value}
                                onChange={e => formSetter.setMadNetProvider(e.target.value)}
                                error={(!!formState.MadNetProvider.error && { content: formState.MadNetProvider.error }) || madError}
                            />

                            <Form.Input
                                id='ethereumProvider'
                                label={
                                    <div className="flex items-center">
                                        <div className="font-bold">
                                            Ethereum Provider
                                        </div>
                                        <div className="relative" style={{ top: "-1px", marginLeft: "4px" }}>
                                            <StatusLight color={web3Color} />
                                        </div>
                                    </div>
                                }
                                disabled={web3Busy}
                                placeholder='Enter Ethereum Provider'
                                required
                                value={formState.EthereumProvider.value}
                                onChange={e => formSetter.setEthereumProvider(e.target.value)}
                                error={(!!formState.EthereumProvider.error && { content: formState.EthereumProvider.error }) || web3Error}
                            />

                            <Form.Input
                                id='registryContractAddress'
                                label={
                                    <div className="flex items-center">
                                        <div className="font-bold">
                                            Registry Contract Address
                                        </div>
                                    </div>
                                }
                                disabled={web3Busy}
                                placeholder='Enter Registry Contract Address'
                                required
                                value={formState.RegistryContractAddress.value}
                                onChange={e => formSetter.setRegistryContractAddress(e.target.value)}
                                error={(!!formState.RegistryContractAddress.error && { content: formState.RegistryContractAddress.error }) || !!registryContractError && {content: registryContractError}}
                            />

                        </Form>

                    </Grid.Column>
                </Grid>

            </Modal.Content>

            <Modal.Actions className="flex justify-between">

                <Button color="orange" className="m-0" basic onClick={handleClose} content="Close" />

                <Button
                    icon={<Icon name='sync' />}
                    className="m-0"
                    content="Retry"
                    basic
                    color="teal"
                    onClick={() => onSubmit(handleSubmit)}
                />

            </Modal.Actions>

        </Modal>
    )

}

function StatusLight({ className, color }) {

    let baseClass = classNames("rounded-full border-solid border", { className: className });
    let colorClass = color === "red" ? "bg-red-500" : color === "yellow" ? "bg-yellow-500 animate-pulse" : color === "green" ? "bg-green-400" : "bg-gray-400";
    let colorBorderClass = color === "red" ? "border-red-400" : color === "yellow" ? "border-yellow-400" : color === "green" ? "border-green-300" : "border-gray-500";

    let fullClass = classNames(baseClass, colorClass, colorBorderClass);

    return (
        <div className={fullClass} style={{ width: "7px", height: "7px" }} />
    )

}