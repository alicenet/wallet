import React from 'react';
import { Form, Header, Segment } from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';
import { DButton } from '../../DebugPanel';
import { classNames } from 'util/generic';
import { VAULT_ACTIONS } from 'redux/actions/_actions';
import GenerateKeystoreForm from 'components/keystore/GenerateKeystoreForm';

export default function OptOutSegment() {

    const dispatch = useDispatch();
    const vault = useSelector(s => s.vault);

    ////////////////////////////
    /*          State         */
    ////////////////////////////
    const [newWalletName, setNewWalletName] = React.useState("test_wallet");

    ////////////////////////////
    /* Vault       Functions  */
    ////////////////////////////
    const printAliceNetWalletInstance = () => {
        dispatch(VAULT_ACTIONS.getAliceNetWallet());
    }

    const addOptOutKeystore = async (keystoreJson, password) => {
        await dispatch(VAULT_ACTIONS.addExternalWalletToState(keystoreJson, password, newWalletName));
    }

    return (
        <Segment disabled={vault.exists} className={classNames({ "pointer-events-none": vault.exists })}>

            {vault.exists ? (
                <Header color="red">Vault Found -- Delete Vault To Test These</Header>
            ) : null}

            <div className="flex justify-between">
                <div>
                    <Header as="h3" className="m-0" content="Optout Wallet Management"/>
                    <div className="flex items-center">
                        <Header as="h6" className="m-0">Vault Instance -- ( Keystore Wallets Still Get Loaded Here )</Header>
                        <Form className="max-w-md m-0 ml-2" size="mini">
                            <Form.Group widths="equal" className="mt-2">
                                <Form.Button size='mini' basic content="Print Vault State" onClick={() => console.log(vault)}/>
                            </Form.Group>
                        </Form>
                    </div>
                </div>
            </div>

            <GenerateKeystoreForm inline defaultPassword="testing" showPassword submitFunction={addOptOutKeystore} customTitle={"Generate And Load Optout Keystore"}/>
            <Form size="mini" className="max-w-sm">
                <Form.Input label="Name for Above Generated Wallet ( Saved As the wallet name on 'Load' )" size="mini" value={newWalletName}
                            onChange={e => setNewWalletName(e.target.value)}/>
            </Form>

            <Header as="h6" className="m-0 mt-2">AliceNet Wallet Instance</Header>
            <p className="text-xs mt-1">State of the Alice Net wallet instance should be balanced with the current redux state.</p>
            <Form className="max-w-xs">
                <DButton color="purple" basic onClick={printAliceNetWalletInstance} content="Print aliceNetWallet instance (getAliceNetWallet)"/>
            </Form>

            <Header as="h6" className="m-0 mt-2">{"Wallet<=>Vault State Verification"}</Header>


        </Segment>
    );

}