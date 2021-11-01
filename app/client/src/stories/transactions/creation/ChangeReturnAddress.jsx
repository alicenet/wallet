import React, { useEffect, useState } from 'react';
import { Form } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import head from 'lodash/head';
import utils from 'util/_util';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';

import { SyncToastMessageWarning } from 'components/customToasts/CustomToasts';

function ChangeReturnAddress({ disabled = false, checkBoxOnChange, checkBoxChecked }) {

    const dispatch = useDispatch();

    const { internal, external } = useSelector(state => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
    }));

    const [selectedReturnWallet, setSelectedReturnWallet] = useState(null);
    const [adHocWallets, setAdHocWallets] = useState([]);

    const wallets = React.useMemo(() => (internal.concat(external).concat(adHocWallets)).map(wallet => {
        return {
            text: `${wallet.name} (0x${utils.string.splitStringWithEllipsis(wallet.address, 5)})`,
            value: wallet.address
        };
    }) || [], [internal, external, adHocWallets]);

    useEffect(() => {
        if (wallets.length > 0 && !selectedReturnWallet) {
            setSelectedReturnWallet(head(wallets).value);
        }
    }, [wallets, selectedReturnWallet]);

    useEffect(() => {
        if (Web3.utils.isAddress(selectedReturnWallet)) {
            dispatch(TRANSACTION_ACTIONS.saveChangeReturnAddress(selectedReturnWallet));

        }
    }, [selectedReturnWallet, dispatch]);

    const handleAddressChange = (e, { value }) => setSelectedReturnWallet(value);

    const handleAddressAdded = (e, { value }) => {
        if (Web3.utils.isAddress(value)) {
            setAdHocWallets(prevState => prevState.concat([{ name: value, address: value }]))
        }
        else {
            toast.error(<SyncToastMessageWarning title="Error " message="Not a valid return address" />, { className: "basic", "autoClose": 1500 })
        }
    };

    return (
        <Form size="small" className="small-checkbox">

            <Form.Dropdown
                disabled={disabled}
                options={wallets}
                placeholder='Choose UTXO Return Address'
                search
                selection
                allowAdditions
                closeOnChange
                defaultValue={head(wallets)?.value}
                onAddItem={handleAddressAdded}
                onChange={handleAddressChange}
            />
        </Form>
    )

}

export default ChangeReturnAddress;
