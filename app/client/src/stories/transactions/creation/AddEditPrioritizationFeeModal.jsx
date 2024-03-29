import React, { useState } from 'react';
import { Button, Form, Grid, Header, Icon, Menu, Modal } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import { useFormState } from 'hooks/_hooks';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import ChangeFeePayer from './ChangeFeePayer';
import FocusTrap from 'focus-trap-react';

export default function AddEditPrioritizationFeeModal() {

    const dispatch = useDispatch();

    const [openModal, setOpenModal] = useState(false);

    const { minFee } = useSelector(state => ({ minFee: state.transaction.fees.minTxFee }));

    const { prioritizationFee, txList } = useSelector(state => ({
        prioritizationFee: state.transaction.fees.prioritizationFee,
        txList: state.transaction.list,
    }));

    const handleSubmit = async () => {
        dispatch(TRANSACTION_ACTIONS.setPrioritizationFee(parseInt(formState.Fee.value)));
        setOpenModal(false);
    };

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'Fee', display: 'AliceNet Bytes Fee', type: 'integer', isRequired: true, value: prioritizationFee },
    ]);

    const handleClose = () => {
        setOpenModal(false);
        formSetter.setFee(prioritizationFee);
        formSetter.clearFeeError();
    };

    return (
        <Modal
            open={openModal}
            onClose={handleClose}
            size="small"
            trigger={
                <Menu.Item as={Button} name='add-prioritization-fee' disabled={txList.length === 0} onClick={() => setOpenModal(true)}>
                    <Icon name="chain" className="text-gray-600" />Adjust Tx Fee
                </Menu.Item>
            }
        >

            <Modal.Header className="text-center">

                <Header as="h4">Prioritization Fee</Header>

            </Modal.Header>

            <FocusTrap>
                <div>
                    <div className="p-4">
                        
                        <Modal.Content>

                            <Form size="small" className="text-sm mini-error-form" onSubmit={() => onSubmit(handleSubmit)}>

                                <Grid className="m-0 content-evenly gap-2">

                                    <Grid.Row>
                                        <Grid.Column width="16">
                                            <p>
                                                AliceNet Transactions cost a minimum fee. <br />
                                                You may provide additional AliceNetBytes to give your transaction priority. <br />
                                            </p>
                                        </Grid.Column>
                                    </Grid.Row>

                                    <Grid.Row columns={1} className="p-0">

                                        <Grid.Column>

                                            <Form.Input
                                                id="MinFee"
                                                label="AliceNet Bytes Minimum Fee"
                                                disabled
                                                value={minFee}
                                            />

                                            <Form.Input
                                                id="Fee"
                                                label="AliceNet Bytes Prioritization Fee"
                                                required
                                                value={formState.Fee.value}
                                                onChange={e => formSetter.setFee(e.target.value)}
                                                error={!!formState.Fee.error && { content: formState.Fee.error }}
                                            />

                                            <ChangeFeePayer />

                                        </Grid.Column>

                                    </Grid.Row>

                                </Grid>

                            </Form>

                        </Modal.Content>
                    </div>

                    <Modal.Actions className="flex justify-between mt-6 border-solid border-t-1 border-b-0 border-l-0 border-r-0 border-gray-300 bg-gray-100 p-4">

                        <Button color="black" basic onClick={handleClose} content="Close" />

                        <Button
                            icon={<Icon name="chain" />}
                            content="Set Prioritization Fee"
                            color="black"
                            onClick={() => onSubmit(handleSubmit)}
                        />

                    </Modal.Actions>

                </div>
            </FocusTrap>

        </Modal>
    );
}