import React from 'react';
import { Button, Form, Grid, Header, Icon, Modal } from 'semantic-ui-react';
import { useFormState } from 'hooks/_hooks';
import { useDispatch, useSelector } from 'react-redux';
import has from 'lodash/has';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import utils, { transactionTypes } from 'util/_util';

export default function AddEditValueStoreModal({ valueStore, onClose }) {

    const dispatch = useDispatch();

    const { internal, external } = useSelector(state => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
    }));

    const wallets = React.useMemo(() => (internal.concat(external)).map(wallet => {
        return {
            text: `${wallet.name} (0x${utils.string.splitStringWithEllipsis(wallet.address, 5)})`,
            value: wallet.address
        };
    }) || [], [internal, external]);

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'From', display: 'From address', type: 'address', isRequired: true, value: valueStore.from },
        { name: 'To', display: 'To address', type: 'address', isRequired: true, value: valueStore.to },
        { name: 'Value', type: 'int', isRequired: true, value: valueStore.value },
    ]);

    const isEditing = has(valueStore, 'index');

    const handleSubmit = async () => {
        if (isEditing) {
            dispatch(TRANSACTION_ACTIONS.editStore({
                ...valueStore,
                from: formState.From.value,
                to: formState.To.value,
                value: formState.Value.value,
            }));
        }
        else {
            dispatch(TRANSACTION_ACTIONS.addStore({
                from: formState.From.value,
                to: formState.To.value,
                value: formState.Value.value,
                type: transactionTypes.VALUE_STORE,
            }));
        }
        onClose();
    };

    return (
        <Modal
            open={!!valueStore}
            onClose={onClose}
            size="small"
        >

            <Modal.Header className="text-center">

                <Header as="h4" className="uppercase" color="purple">{`${isEditing ? 'Edit' : 'Add'} Value Store`}</Header>

            </Modal.Header>

            <Modal.Content>

                <Form size="small" className="text-sm mini-error-form" onSubmit={() => onSubmit(handleSubmit)}>

                    <Grid className="m-0 content-evenly gap-2">

                        <Grid.Row columns={1} className="p-0">

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

                        </Grid.Row>

                        <Grid.Row columns={1} className="p-0">

                            <Grid.Column>

                                <Form.Input
                                    id='To'
                                    label='To'
                                    required
                                    value={formState.To.value}
                                    onChange={e => formSetter.setTo(e.target.value)}
                                    error={!!formState.To.error && { content: formState.To.error }}
                                />

                            </Grid.Column>

                        </Grid.Row>

                        <Grid.Row columns={1} className="p-0">

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

                <Button color="orange" className="m-0" basic onClick={onClose} content="Close"/>

                <Button
                    icon={<Icon name="currency"/>}
                    className="m-0"
                    content={`${isEditing ? 'Edit' : 'Add'} Value Store`}
                    basic
                    color="teal"
                    onClick={() => onSubmit(handleSubmit)}
                />

            </Modal.Actions>

        </Modal>
    )
}