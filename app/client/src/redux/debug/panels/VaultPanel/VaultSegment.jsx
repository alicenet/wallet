import React from 'react';
import { Segment, Form, Header } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { VAULT_ACTIONS } from 'redux/actions/_actions';
import { DButton } from '../../DebugPanel.jsx';
import { classNames } from 'util/_util';
import { } from 'store/electronStoreHelper';
import GenerateKeystoreForm from 'components/keystore/GenerateKeystoreForm.jsx';

/** 
 * @prop {Boolean} isActive - Is this an open accordion segment? 
 */
export default function VaultSegment() {

    const dispatch = useDispatch();
    const vault = useSelector(s => s.vault);

    const [vaultLoading, setVaultLoading] = React.useState(false);

    ////////////////////////////
    /*          State         */
    ////////////////////////////
    const [password, setPassword] = React.useState("testing");
    const [newWalletName, setNewWalletName] = React.useState("test_wallet");

    ////////////////////////////
    /* Vault       Functions  */
    ////////////////////////////
    const printMadWalletInstance = () => {
        let madWallet = dispatch(VAULT_ACTIONS.getMadWallet());
        console.log(madWallet);
    }

    const unlockVault = async () => {
        console.log("DEBUG:: Attempt unlock vault with password: " + password);
        setVaultLoading(true);
        let [done, errors] = await dispatch(VAULT_ACTIONS.loadSecureHDVaultFromStorage(password));
        setVaultLoading(false);
    }

    const lockVault = async () => {
        let done = await dispatch(VAULT_ACTIONS.lockVault());
    }

    const addWalletFromKeystore = async (keystoreJson, password) => {
        let success = await dispatch(VAULT_ACTIONS.addExternalWalletToState(keystoreJson, password, newWalletName));
    }

    const deleteVault = () => {
        console.log('TBD')
    }

    //////////////////////
    // Micro Components //
    //////////////////////
    const statusKv = (key, value, positive) => (
        <span className="font-bold first:ml-0 ml-4">{key}:
            <span className={classNames("font-light text-gray-400 ml-1", { "text-green-600": positive })}>{value}</span>
        </span>
    )

    ////////////
    // RETURN //
    ////////////

    return (
        <Segment disabled={!vault.exists} className={classNames({"pointer-events-none": !vault.exists})}>

            {!vault.exists ? (
                <Header color="red">No Vault Found</Header>
            ) : null}

            <div className="flex justify-between">
                <div>
                    <Header as="h3" className="m-0" content="Vault and Wallet Management" />
                </div>
                <div>
                    {statusKv("exists", String(vault.exists), !!vault.exists)}
                    {statusKv("locked", String(vault.is_locked), !!vault.is_locked)}
                    {statusKv("i_wallets", String(vault.wallets.internal.length))}
                    {statusKv("e_wallets", String(vault.wallets.external.length))}
                </div>
            </div>

            <Header as="h6" className="m-0 mt-2">Vault Instance</Header>
            <Form className="max-w-md m-0" size="mini">
                <Form.Group widths="equal" className="mt-2">
                    <Form.Input size='mini' value={password} onChange={e => setPassword(e.target.value)}
                        action={{ loading: vaultLoading, content: vault.is_locked ? "Unlock" : "Lock", size: "mini", color: vault.is_locked ? "green" : "red", basic: true, onClick: vault.is_locked ? unlockVault : lockVault }} />
                    <Form.Button size='mini' basic content="Print Vault State" onClick={() => console.log(vault)} />
                </Form.Group>
            </Form>

            {vault.is_locked ? (
                <div className="text-xs mb-3 text-red-600 ml-1 -mt-1">
                    Unlocking a vault overwrites the current wallet/vault state as it is a core initial action that doesn't happen frequently
                </div>
            ) : null}

            <GenerateKeystoreForm inline defaultPassword="testing" showPassword loadKeystoreCB={addWalletFromKeystore} />
            <Form size="mini" className="max-w-sm">
                <Form.Input label="Name for Above Generated Wallet ( Saved As the wallet name on 'Load' )" size="mini" value={newWalletName} onChange={e => setNewWalletName(e.target.value)} />
            </Form>

            <Header as="h6" className="m-0 mt-2">Mad Wallet Instance</Header>
            <p className="text-xs mt-1">State of the mad wallet instance should be balanced with the current redux state.</p>
            <Form className="max-w-xs">
                <DButton color="purple" basic onClick={printMadWalletInstance} content="Print madWallet instance (getMadWallet)" />
            </Form>

            <Header as="h6" className="m-0 mt-2">{"Wallet<=>Vault State Verification"}</Header>


        </Segment>
    )

}