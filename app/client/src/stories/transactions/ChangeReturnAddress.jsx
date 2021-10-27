import React, { useEffect, useState } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import head from 'lodash/head';
import utils from 'util/_util';

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
    }) || [], [internal, external]);

    const handleAddressChange = (e, { value }) => setSelectedReturnWallet(value);

    const handleAddressAdded = (e, { value }) => {
        setAdHocWallets(prevState => prevState.concat([{ text: `New Return Address (${value})`, value }]))
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
