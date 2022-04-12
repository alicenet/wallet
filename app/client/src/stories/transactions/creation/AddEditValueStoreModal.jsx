import React, { useMemo, useState } from 'react';
import { Button, Checkbox, Form, Grid, Header, Icon, Modal, Popup } from 'semantic-ui-react';
import { useFormState } from 'hooks/_hooks';
import { useDispatch, useSelector } from 'react-redux';
import has from 'lodash/has';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import utils, { transactionTypes } from 'util/_util';

export default function AddEditValueStoreModal({ valueStore, onClose }) {

    const dispatch = useDispatch();

    const { internal, external, fees } = useSelector(state => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
        fees: state.transaction.fees,
    }));

    const wallets = useMemo(() => (internal.concat(external)).map(wallet => {
        return {
            text: `${wallet.name} (${utils.string.addCurvePrefix(utils.string.splitStringWithEllipsis(wallet.address, 5), wallet.curve)})`,
            value: wallet.address
        };
    }) || [], [internal, external]);

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'From', display: 'From address', type: 'address', isRequired: true, value: valueStore.from },
        { name: 'To', display: 'To address', type: 'address', isRequired: true, value: valueStore.to },
        { name: 'Value', type: 'int', isRequired: true, value: valueStore.value },
    ]);

    const isEditing = has(valueStore, 'index');

    const [useBNCurve, setUseBNCurve] = useState(valueStore.bnCurve);
    const toggleCurveType = () => setUseBNCurve(s => !s);

    const handleSubmit = async () => {
        const bnCurveFrom = internal.concat(external).find(wallet => wallet.address === formState.From.value).curve;
        if (isEditing) {
            dispatch(TRANSACTION_ACTIONS.editStore({
                ...valueStore,
                from: formState.From.value,
                bnCurveFrom,
                to: formState.To.value,
                value: formState.Value.value,
                bnCurve: useBNCurve,
            }));
        }
        else {
            dispatch(TRANSACTION_ACTIONS.addStore({
                from: formState.From.value,
                bnCurveFrom,
                to: formState.To.value,
                value: formState.Value.value,
                bnCurve: useBNCurve,
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

                <Header as="h4">{`${isEditing ? 'Edit' : 'Add'} Value Store`}
                    <Header.Subheader className="text-xs">Base Fee Per Value Store: {fees.valueStoreFee} MadByte{fees.valueStoreFee > 1 ? "s" : ""}</Header.Subheader>
                </Header>

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

                        <Grid.Row columns={2} className="p-0 justify-around">

                            <Grid.Column width="12">

                                <Form.Input
                                    id="To"
                                    label="To"
                                    value={formState.To.value}
                                    onChange={e => formSetter.setTo(e.target.value)}
                                    error={!!formState.To.error && { content: formState.To.error }}
                                />

                            </Grid.Column>

                            <Grid.Column width="4" className="flex justify-end pl-0">

                                <Checkbox
                                    className="flex justify-center items-end text-xs uppercase font-bold pb-2"
                                    checked={useBNCurve}
                                    onChange={toggleCurveType}
                                    label={
                                        <>
                                            <label className={"labelCheckbox"}>Is BN Curve</label>
                                            <Popup
                                                size="mini"
                                                position="right center"
                                                trigger={<Icon name="question circle" className="ml-1 mb-1.5" />}
                                                content="Is this a BN Curve address?"
                                            />
                                        </>
                                    }
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

                <Button color="black" basic onClick={onClose} content="Close" />

                <Button
                    icon={<Icon name="currency" />}
                    content={`${isEditing ? 'Edit' : 'Add'} Value Store`}
                    color="black"
                    onClick={() => onSubmit(handleSubmit)}
                />

            </Modal.Actions>

        </Modal>
    )
}