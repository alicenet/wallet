import React, { useEffect } from 'react';
import { Button, Container, Header, Icon, Menu, Modal } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { CONFIG_ACTIONS } from 'redux/actions/_actions';

function ConstructingATransactionModal() {

    const dispatch = useDispatch();
    const [openModal, setOpenModal] = React.useState(false);

    const { hasSeenTxHelpModal } = useSelector(state => ({
        hasSeenTxHelpModal: state.config.has_seen_tx_help_modal
    }));

    const handleCloseModal = () => {
        dispatch(CONFIG_ACTIONS.saveConfigurationValues({
            hasSeenTxHelpModal: true,
        }));
        setOpenModal(false);
    };

    useEffect(() => {
        hasSeenTxHelpModal ? setOpenModal(false) : setOpenModal(true);
    }, [hasSeenTxHelpModal]);

    return (
        <Modal
            onClose={() => setOpenModal(false)}
            onOpen={() => setOpenModal(true)}
            open={openModal}
            dimmer="inverted"
            trigger={
                <Menu.Item name="how-to-construct-a-transaction" onClick={() => setOpenModal(true)}>
                    <Icon name="question" className="text-gray-600" />Build Transaction
                </Menu.Item>
            }
        >

            <Modal.Content>

                <Modal.Description className="flex flex-col items-center gap-10">

                    <Header content="Constructing a Transaction" as="h3" className="my-0" />

                    <Container className="flex flex-auto flex-col gap-3 p-5 text-left">

                        <p>You can construct a transaction by choosing between <strong>data stores</strong> and <strong>value stores</strong>.</p>

                        <p>A single transaction can have up to 128 stores of either types.</p>

                        <p><strong>Value stores</strong> will be used to transfer MadBytes from one address to another.</p>

                        <p><strong>Data stores</strong> are used to store a key
                            and value on MadNet for up until the purchased-to epoch.</p>

                        <p>You can also cancel a <strong>data store</strong> early and receive a refund for any unused duration.</p>

                    </Container>

                    <Button color="teal" onClick={handleCloseModal} content="Got it!" />

                </Modal.Description>

            </Modal.Content>

        </Modal>
    )

}

export default ConstructingATransactionModal;
