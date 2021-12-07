import React, { useEffect, useState } from 'react';
import { Form } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import head from 'lodash/head';
import utils from 'util/_util';
import Web3 from 'web3';
import { toast } from 'react-toastify';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';

import { SyncToastMessageWarning } from 'components/customToasts/CustomToasts';

function ChangeFeePayer({ disabled = false }) {

    const dispatch = useDispatch();

    const { internal, external, feePayerWallet } = useSelector(state => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
        feePayerWallet: state.transaction.feePayer.wallet,
    }));

    const wallets = React.useMemo(() => (internal.concat(external)).map(wallet => {
        return {
            text: `${wallet.name} (0x${utils.string.splitStringWithEllipsis(wallet.address, 5)})`,
            value: wallet.address,
            wallet: wallet
        };
    }) || [], [internal, external]);

    const handleAddressChange = (e, { value }) => {
        let selectedWallet = utils.wallet.getVaultWalletByAddress(value);
        dispatch(TRANSACTION_ACTIONS.setFeePayer(selectedWallet, true));
    };

    return (
        <Form size="small" className="small-checkbox">
            <Form.Dropdown
                label="Fee Payer"
                disabled={disabled}
                options={wallets}
                placeholder='Choose Fee Payer Wallet'
                search
                selection
                closeOnChange
                defaultValue={feePayerWallet.address}
                onChange={handleAddressChange}
            />
        </Form>
    )

}

export default ChangeFeePayer;
