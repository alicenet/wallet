import React, { useEffect, useState } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import head from 'lodash/head';
import utils from 'util/_util';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import { SyncToastMessageWarning } from 'components/customToasts/CustomToasts';

function ChangeReturnAddress() {

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

    const handleAddressChange = (e, { value }) => setSelectedReturnWallet(value);

    const handleAddressAdded = (e, { value }) => {
        if (Web3.utils.isAddress(value)) {
            setAdHocWallets(prevState => prevState.concat([{ name: `Change Return Address (${value})`, address: value }]))
        }
        else {
            toast.error(<SyncToastMessageWarning title="Error " message="Not a valid return address"/>, { className: "basic", "autoClose": 1500 })
        }
    };

    useEffect(() => {
        if (wallets.length > 0) {
            setSelectedReturnWallet(head(wallets).address);
        }
    }, [wallets]);

    return (
        <Dropdown
            options={wallets}
            placeholder='Choose UTXO Return Address'
            search
            selection
            fluid
            allowAdditions
            value={selectedReturnWallet}
            onAddItem={handleAddressAdded}
            onChange={handleAddressChange}
        />
    )

}

export default ChangeReturnAddress;
