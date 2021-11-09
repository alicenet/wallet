import React from 'react';
import { Button, Form, Grid, Header, Icon, Menu, Modal } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import { useFormState } from 'hooks/_hooks';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';

export default function AddEditPrioritizationFeeModal() {

    const dispatch = useDispatch();

    const [openModal, setOpenModal] = React.useState(false)

    const { prioritizationFee } = useSelector(state => ({
        prioritizationFee: state.transaction.fees.prioritizationFee,
    }));

    const handleSubmit = async () => {
        dispatch(TRANSACTION_ACTIONS.setPrioritizationFee(formState.Fee.value));
        setOpenModal(false);
    };

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'Fee', display: 'MadNet Bytes Fee', type: 'integer', isRequired: true, value: prioritizationFee },
    ]);

    const handleClose = () => {
        setOpenModal(false);
        formSetter.setFee(prioritizationFee);
        formSetter.clearFeeError();
    }

    return (
        <Modal
            open={openModal}
            onClose={handleClose}
            size="small"
            trigger={
                <Menu.Item name='add-prioritization-fee' onClick={() => setOpenModal(true)}>
                    <Icon name="chain" className="text-gray-600"/>Prioritization Fee
                </Menu.Item>
            }
        >

            <Modal.Header className="text-center">

                <Header as="h4" className="uppercase" color="purple">{`Prioritization Fee`}</Header>

            </Modal.Header>

            <Modal.Content>

                <Form size="small" className="text-sm mini-error-form" onSubmit={() => onSubmit(handleSubmit)}>

                    <Grid className="m-0 content-evenly gap-2">

                        <Grid.Row columns={1} className="p-0">

                            <Grid.Column>

                                <Form.Input
                                    id='Fee'
                                    label='MadNet Bytes Fee'
                                    required
                                    value={formState.Fee.value}
                                    onChange={e => formSetter.setFee(e.target.value)}
                                    error={!!formState.Fee.error && { content: formState.Fee.error }}
                                />

                            </Grid.Column>

                        </Grid.Row>

                    </Grid>

                </Form>

            </Modal.Content>

            <Modal.Actions className="flex justify-between">

                <Button color="orange" className="m-0" basic onClick={handleClose} content="Close"/>

                <Button
                    icon={<Icon name='chain'/>}
                    className="m-0"
                    content="Set Prioritization Fee"
                    basic
                    color="teal"
                    onClick={() => onSubmit(handleSubmit)}
                />

            </Modal.Actions>

        </Modal>
    )
}