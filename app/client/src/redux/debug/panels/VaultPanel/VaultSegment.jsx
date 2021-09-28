import React from 'react';
import { Segment, Form, Header } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import { VAULT_ACTIONS } from 'redux/actions/_actions';
import { DButton } from '../../DebugPanel.jsx';
import { classNames } from 'util/_util';

/** 
 * @prop {Boolean} isActive - Is this an open accordion segment? 
 */
export default function VaultSegment() {

    const dispatch = useDispatch();
    const vault = useSelector(s => s.vault);

    ////////////////////////////
    /*          State         */
    ////////////////////////////
    const [password, setPassword] = React.useState("testing");

    ////////////////////////////
    /* Vault       Functions  */
    ////////////////////////////
    const printMadWalletInstance = () => {
        let madWallet = dispatch(VAULT_ACTIONS.getMadWallet());
        console.log(madWallet);
    }

    const unlockVault = () => {
        console.log("DEBUG:: Attempt unlock vault with password: " + password);
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
        <Segment>

            <div className="flex justify-between">
                <div>
                    <Header as="h3" className="m-0" content="Vault and Wallet Management" className="inline" />
                </div>
                <div>
                    {statusKv("exists", String(vault.exists), !!vault.exists)}
                    {statusKv("locked", String(vault.is_locked), !!vault.is_locked)}
                    {statusKv("i_wallets", String(vault.wallets.internal.length))}
                    {statusKv("e_wallets", String(vault.wallets.external.length))}
                </div>
            </div>

            <Header as="h6" className="m-0 mt-2">Vault Instance</Header>
            <Form className="max-w-md m-0">
                <Form.Group widths="equal" className="mt-2">
                    <Form.Input size='mini' value={password} onChange={e => setPassword(e.target.value)} action={{ content: "Unlock", size: "mini", color: "green", basic: true, onClick: unlockVault }} />
                    <Form.Button size='mini' basic content="Print Vault State" onClick={() => console.log(vault)} />
                </Form.Group>
            </Form>


            <Header as="h6" className="m-0 mt-2">Mad Wallet Instance</Header>
            <Form className="max-w-xs" className="mt-2">
                <DButton basic={false} color="purple" basic onClick={printMadWalletInstance} content="Print madWallet instance (getMadWallet)" />
            </Form>

            <Header as="h6" className="m-0 mt-2">{"Wallet<=>Vault State Verification"}</Header>


        </Segment>
    )

}