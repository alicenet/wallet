import React from 'react';
import { Form } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import utils from 'util/_util';
import { TRANSACTION_ACTIONS } from 'redux/actions/_actions';


function ChangeFeePayer({ disabled = false }) {

    const dispatch = useDispatch();

    const { internal, external, feePayerWallet } = useSelector(state => ({
        internal: state.vault.wallets.internal,
        external: state.vault.wallets.external,
        feePayerWallet: state.transaction.feePayer.wallet,
    }));

    const wallets = React.useMemo(() => (internal.concat(external)).map(wallet => {
        return {
            text: `${wallet.name} (${utils.string.addCurvePrefix(utils.string.splitStringWithEllipsis(wallet.address, 5), wallet.curve)})`,
            value: wallet.address,
            wallet: wallet
        };
    }) || [], [internal, external]);

    const handleAddressChange = (e, { value }) => {
        let selectedWallet = utils.wallet.getVaultWalletByAddress(value);
        dispatch(TRANSACTION_ACTIONS.setFeePayer(selectedWallet, true));
    };

    return (
        <Form.Select
            fluid
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
    )

}

export default ChangeFeePayer;
