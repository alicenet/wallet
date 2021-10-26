import React from 'react';
import { Button, Form, Grid, Header, Icon, Menu, Modal } from 'semantic-ui-react';
import { useFormState } from 'hooks/_hooks';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import { SyncToastMessageSuccess } from 'components/customToasts/CustomToasts';

export default function AddValueStoreButton({ valueStore }) {

    const [isOpen, setOpen] = React.useState(false);

    const dispatch = useDispatch();

    const [formState, formSetter, onSubmit] = useFormState([
        { name: 'From', display: 'From address', type: 'address', isRequired: true, value: valueStore.from },
        { name: 'To', display: 'To address', type: 'address', isRequired: true, value: valueStore.to },
        { name: 'Value', type: 'string', isRequired: true, value: valueStore.value },
    ]);

    const handleSubmit = async () => {
        dispatch(TRANSACTION_ACTIONS.addValueStore({
            from: formState.From.value,
            to: formState.To.value,
            value: formState.Value.value,
        }));
        toast.success(
            <SyncToastMessageSuccess basic title="Success" message="Value store added"/>,
            { className: "basic", "autoClose": 1000 }
        );
        setOpen(s => !s);
        formSetter.setFrom('');
        formSetter.setTo('');
        formSetter.setValue('');
    };

    const toggleOpen = () => {
        formSetter.clearFromError();
        formSetter.clearToError();
        formSetter.clearValueError();
        setOpen(s => !s);
    };

    return (
        <Modal
            open={isOpen}
            onOpen={toggleOpen}
            onClose={toggleOpen}
            size="small"
            trigger={<Menu.Item name='add-value-store'><Icon name='currency'/>Add Value Store</Menu.Item>}
        >

            <Modal.Header className="text-center">

                <Header as="h4" className="uppercase" color="purple">Add Value Store</Header>

            </Modal.Header>

            <Modal.Content>

                <Form className="text-sm" onSubmit={() => onSubmit(handleSubmit)}>

                    <Grid className="m-0 content-evenly gap-2">

                        <Grid.Row columns={1} className="p-0">

                            <Grid.Column>

                                <Form.Input
                                    id='From'
                                    label='From'
                                    required
                                    value={formState.From.value}
                                    onChange={e => formSetter.setFrom(e.target.value)}
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

                <Button color="orange" className="m-0" basic onClick={toggleOpen} content="Close"/>

                <Button icon={<Icon name='currency'/>} className="m-0" content="Add Value Store" basic color="teal" onClick={() => onSubmit(handleSubmit)}/>

            </Modal.Actions>

        </Modal>
    )
}