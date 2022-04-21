import React, { useEffect, useState } from 'react';
import { Button, Form, Header, Modal } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import Web3 from 'web3';
import { toast } from 'react-toastify';

import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';
import utils from 'util/_util';
import head from 'lodash/head';
import { SyncToastMessageWarning } from 'components/customToasts/CustomToasts';
import { curveTypes } from "../../../util/wallet";

export default function ChangeReturnAddressModal({ open, onClose }) {

    const dispatch = useDispatch();

    const { internal, external, changeReturn } = useSelector(state => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
        changeReturn: state.transaction.changeReturn,
    }));

    const [selectedReturnWallet, setSelectedReturnWallet] = useState(changeReturn?.address);
    const [adHocWallets, setAdHocWallets] = useState([]);

    const wallets = React.useMemo(() => (internal.concat(external).concat(adHocWallets)).map(wallet => {
        return {
            text: `${wallet.name} (${utils.string.addCurvePrefix(wallet.address, wallet.curve)})`,
            value: wallet.address,
            curve: wallet.curve
        };
    }) || [], [internal, external, adHocWallets]);

    useEffect(() => {
        if (wallets.length > 0 && !selectedReturnWallet && !changeReturn) {
            setSelectedReturnWallet(head(wallets).value);
        }
    }, [wallets, selectedReturnWallet, changeReturn]);

    useEffect(() => {
        if (Web3.utils.isAddress(selectedReturnWallet)) {
            dispatch(TRANSACTION_ACTIONS.saveChangeReturnAddress({
                address: utils.string.removeHexPrefix(selectedReturnWallet),
                curve: wallets.find(wallet => wallet.value === selectedReturnWallet)?.curve
            }));
        }
    }, [selectedReturnWallet, dispatch]);

    const handleAddressChange = (e, { value }) => setSelectedReturnWallet(value);

    const handleAddressAdded = (e, { value }) => {
        if (Web3.utils.isAddress(value)) {
            setAdHocWallets(prevState => prevState.concat([{ name: "New Wallet", address: value, curve: curveTypes.SECP256K1 }]));
        }
        else {
            toast.error(<SyncToastMessageWarning title="Error" message="Not a valid return address" />, { className: "basic", "autoClose": 1500 });
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="small"
        >

            <Modal.Header className="text-center">

                <Header as="h4">Change Return Address</Header>

            </Modal.Header>

            <Modal.Content>

                <Form size="small" className="text-sm mini-error-form">

                    <Form.Dropdown
                        options={wallets}
                        placeholder='Choose UTXO Return Address'
                        search
                        selection
                        allowAdditions
                        closeOnChange
                        defaultValue={selectedReturnWallet}
                        onAddItem={handleAddressAdded}
                        onChange={handleAddressChange}
                    />

                </Form>

            </Modal.Content>

            <Modal.Actions className="flex justify-between">

                <Button color="black" basic onClick={onClose} content="Close" />

            </Modal.Actions>

        </Modal>
    )
}