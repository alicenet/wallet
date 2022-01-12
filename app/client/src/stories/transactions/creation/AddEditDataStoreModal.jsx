import React, { useEffect, useState } from 'react';
import { Button, Form, Grid, Header, Icon, Modal } from 'semantic-ui-react';
import { useFormState } from 'hooks/_hooks';
import { useDispatch, useSelector } from 'react-redux';
import has from 'lodash/has';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import utils, { transactionTypes } from 'util/_util';
import { getMadWalletInstance } from "redux/middleware/WalletManagerMiddleware";

export default function AddEditDataStoreModal({ dataStore, onClose }) {

    let madWallet = getMadWalletInstance();

    const [calculatedFee, setCalculatedFee] = useState(0);

    const dispatch = useDispatch();

    const { internal, external, fees } = useSelector(state => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
        fees: state.transaction.fees,
    }));

    const wallets = React.useMemo(() => (internal.concat(external)).map(wallet => {
        return {
            text: `${wallet.name} (0x${utils.string.splitStringWithEllipsis(wallet.address, 5)})`,
            value: wallet.address
        };
    }) || [], [internal, external]);

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'From', display: 'From address', type: 'address', isRequired: true, value: dataStore.from },
        { name: 'Duration', type: 'integer', isRequired: true, value: dataStore.duration },
        { name: 'Key', type: 'string', isRequired: true, value: dataStore.key },
        { name: 'Value', type: 'string', isRequired: true, value: dataStore.value },
    ]);

    const isEditing = has(dataStore, 'index');

    const handleSubmit = async () => {
        if (isEditing) {
            dispatch(TRANSACTION_ACTIONS.editStore({
                ...dataStore,
                from: formState.From.value,
                key: formState.Key.value,
                value: formState.Value.value,
                duration: formState.Duration.value,
            }));
        }
        else {
            dispatch(TRANSACTION_ACTIONS.addStore({
                from: formState.From.value,
                key: formState.Key.value,
                value: formState.Value.value,
                duration: formState.Duration.value,
                type: transactionTypes.DATA_STORE,
            }));
        }
        onClose();
    };

    useEffect(() => {
        const calculateFee = async () => {
            try{
                if(formState.Duration.value && formState.Value.value){                
                    const dataStoreFee = await madWallet.Transaction.Utils.calculateFee(fees.dataStoreFee, formState.Duration.value);
                    const depositFee = await madWallet.Transaction.Utils.calculateDeposit(formState.Value.value, formState.Duration.value);
                    
                    // eslint-disable-next-line no-undef
                    const totalStoreCost = BigInt(dataStoreFee) + BigInt(depositFee) + BigInt(fees.dataStoreFee)
                    setCalculatedFee(totalStoreCost);
                }
            }catch(error){
                console.log(error)
                setCalculatedFee(0);
            }
        }
        calculateFee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[fees, formState.Duration.value, formState.Value.value]);

    const totalStoreCostLabel = calculatedFee ? `Total Store Cost: ${calculatedFee} ${utils.string.pluralStringCheck("MadByte", calculatedFee > 1)}` : ''

    return (
        <Modal
            open={!!dataStore}
            onClose={onClose}
            size="large"
        >

            <Modal.Header className="text-center">

                <Header as="h4" className="uppercase" color="purple">{`${isEditing ? 'Edit' : 'Add'} Data Store`}
                    <Header.Subheader className="text-xs">Fee Per Data Store: {fees.dataStoreFee} {utils.string.pluralStringCheck("MadByte", fees.dataStoreFee > 1)}</Header.Subheader>
                </Header>

            </Modal.Header>

            <Modal.Content>

                <Form size="small" className="text-sm mini-error-form" onSubmit={() => onSubmit(handleSubmit)}>

                    <Grid className="m-0 content-evenly gap-2">

                        <Grid.Row columns={2} className="p-0">

                            <Grid.Column>

                                <Form.Select
                                    required
                                    id='From'
                                    label='From'
                                    options={wallets}
                                    selection
                                    closeOnChange
                                    value={formState.From.value}
                                    onChange={(e, { value }) => formSetter.setFrom(value)}
                                    error={!!formState.From.error && { content: formState.From.error }}
                                />

                            </Grid.Column>

                            <Grid.Column>

                                <Form.Input
                                    id='Duration'
                                    label='Duration'
                                    required
                                    value={formState.Duration.value}
                                    onChange={e => formSetter.setDuration(e.target.value)}
                                    error={!!formState.Duration.error && { content: formState.Duration.error }}
                                />

                            </Grid.Column>

                        </Grid.Row>

                        <Grid.Row columns={2} className="p-0">

                            <Grid.Column>

                                <Form.Input
                                    id='Key'
                                    label='Key'
                                    required
                                    value={formState.Key.value}
                                    onChange={e => formSetter.setKey(e.target.value)}
                                    error={!!formState.Key.error && { content: formState.Key.error }}
                                />

                            </Grid.Column>

                            <Grid.Column>

                                <Form.Input
                                    id='Value'
                                    label='Value'
                                    required
                                    value={formState.Value.value}
                                    onChange={e => formSetter.setValue(e.target.value)}
                                    error={!!formState.Value.error && { content: formState.Value.error }}
                                />

                            </Grid.Column>

                        </Grid.Row>

                    </Grid>
                </Form>

            </Modal.Content>

            <Modal.Actions className="flex justify-between">

                <Button color="orange" className="m-0" basic onClick={onClose} content="Close" />

                <div className="flex flex-column justify-center items-center text-sm">
                    {totalStoreCostLabel}
                </div>

                <Button
                    icon={<Icon name='chart bar' />}
                    className="m-0"
                    content={`${isEditing ? 'Edit' : 'Add'} Data Store`}
                    basic
                    color="teal"
                    onClick={() => onSubmit(handleSubmit)}
                />

            </Modal.Actions>

        </Modal>
    )
}