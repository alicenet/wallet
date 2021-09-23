import React from 'react';
import { connect } from "react-redux";
import { Button, Grid, Header, TextArea, Form, FormButton, ButtonGroup } from 'semantic-ui-react';
import { USER_ACTIONS, MODAL_ACTIONS, VAULT_ACTIONS, INTERFACE_ACTIONS } from 'redux/actions/_actions';
import { useHistory } from 'react-router-dom';

import util from 'util/_util';
import { electronStoreUtilityActons, electronStoreUtilityActons as utilStoreHelper } from '../../store/electronStoreHelper';

function DebugActionPanel({ dispatch, vault }) {

    const history = useHistory();

    const [testingMnemonic, setTestingMnemonic] = React.useState("unknown hold print furnace paper walk crucial junk country list phrase because");

    const [valueToWrite, setValueToWrite] = React.useState("");
    const [customStorageKey, setCustomStorageKey] = React.useState("testKey")
    const [customValueRead, setCustomValueRead] = React.useState("testKey");
    const [storeReadOutput, setStoreReadOutput] = React.useState("_");

    const [seedBytes, setSeedBytes] = React.useState(false);
    const [hdChain, setHdChain] = React.useState(false);
    const [walletNode, setWalletNode] = React.useState(false);

    const [vaultPassword, setVaultPassword] = React.useState("");

    const DButton = (props) => <Form.Button basic size="mini" fluid {...props} className={"m-1 ml-0 " + props.className} />

    /* Check if user has a vault behind the scenes */
    React.useEffect(() => {
        const checkForAccount = async () => {
            await dispatch(USER_ACTIONS.checkForUserAccount());
        }
        checkForAccount();
    }, [dispatch]);

    // Nav Actions //
    const goto = (locationPath) => {
        dispatch(INTERFACE_ACTIONS.DEBUG_toggleShowDebug(false));
        history.push(locationPath)
    }

    ////////////////////////////
    /*      Vault Actions     */
    ////////////////////////////
    const deleteVault = () => {
        console.log('')
    }

    ////////////////////////////
    /* Wallet Util Functions  */
    ////////////////////////////
    const utilWalletSpinNewMnemonc = async () => {
        setTestingMnemonic(await util.wallet.generateBip39Mnemonic());
        setSeedBytes(false);
        setHdChain(false);
        setWalletNode(false);
    }

    const getSeedBytesFromMnemonic = async () => {
        setSeedBytes(await util.wallet.getSeedBytesFromMnemonic(testingMnemonic));
    }

    const getHDChainFromSeedBytes = async () => {
        setHdChain(await util.wallet.getHDChainFromSeedBytes(seedBytes));
    }

    const getNodeFromHDChain = async () => {
        setWalletNode(await util.wallet.getHDWalletNodeFromHDChain(hdChain));
    }


    //////////////////////
    // Store Operations //
    //////////////////////
    const deleteStore = () => {
        electronStoreUtilityActons.completelyDeleteElectronStore();
    }

    const readValue = async () => {
        let read = await utilStoreHelper.readPlainValueFromStore(customValueRead)
        if (read.error) { read = read.error }
        return setStoreReadOutput(read);
    }

    const readSecure = async () => {
        if (!vaultPassword) { return setVaultPassword("REQUIRED FOR READ!"); }
        let read = await utilStoreHelper.readEncryptedValueFromStore(customValueRead, vaultPassword);
        if (read.error) { read = read.error }
        return setStoreReadOutput(read);
    }

    const writeValue = async () => {
        if (!valueToWrite || !customStorageKey) { return console.warn("Fill out key && value for write debugging!") }
        utilStoreHelper.writePlainValueToStore(customStorageKey, valueToWrite);
    }

    const saveMnemonicAsVault = async () => {
        if (!vaultPassword) { return setVaultPassword("REQUIRED FOR VAULT SET!"); }
        let test = await dispatch(VAULT_ACTIONS.generateNewSecureHDVault(testingMnemonic, vaultPassword))
        console.log(test);
    }

    const printMadWalletInstance = () => {
        let madWallet = dispatch(VAULT_ACTIONS.getMadWallet());
        console.log(madWallet);
    }

    return (

        <Grid>

            <Grid.Column width={8}>
                <Header as="h4">ELECTRON STORE ACTIONS</Header>

                <Form>
                    <Form.Group widths="equal">
                        <DButton content='read("testKey")' onClick={() => utilStoreHelper.readPlainValueFromStore("testKey")} />
                        <DButton content='write("testKey", "testVal")' onClick={() => utilStoreHelper.writePlainValueToStore("testKey", "testVal")} />
                    </Form.Group>
                    <Form.Group widths="equal">
                        <DButton content='secWrite("EtestKey", "EtestVal")' onClick={() => utilStoreHelper.writeEncryptedToStore("EtestKey", "EtestVal", "test")} />
                        <DButton content='read("EtestVal"' onClick={() => utilStoreHelper.readPlainValueFromStore("EtestKey")} />
                    </Form.Group>

                    <DButton content='decipher("EtestVal"' onClick={() => utilStoreHelper.readEncryptedValueFromStore("EtestKey", "test")} />

                </Form>

                <Button size="mini" fluid content="electron_DELETE_STORE_NO_CONFIRM" onClick={deleteStore} color="red" className="mt-4" />

                <Header as="h5">Custom Store Write/Reads</Header>

                <Form>
                    <Form.Group widths="equal">
                        <Form.Input value={customStorageKey} size="mini" placeholder="Storage Key To Write" onChange={e => setCustomStorageKey(e.target.value)} />
                        <Form.Input value={valueToWrite} size="mini" placeholder="Storage Value To Write" onChange={e => setValueToWrite(e.target.value)} />
                    </Form.Group>

                    <FormButton fluid size="mini" content="Write" onClick={writeValue} />

                    <Form.Group widths="equal">
                        <Form.Input value={customValueRead} onChange={e => setCustomValueRead(e.target.value)} size="mini" placeholder="PlainReadKey" />
                        <ButtonGroup size="mini">
                            <FormButton fluid size="mini" content="Read" onClick={readValue} />
                            <FormButton fluid size="mini" content="Decipher" onClick={readSecure} className="ml-2" />
                        </ButtonGroup>
                    </Form.Group>

                    <Header as="h6" className="mt-1 mb-0">Read Output</Header>
                    <TextArea className="mt-1" value={typeof storeReadOutput === "object" ? JSON.stringify(storeReadOutput) : storeReadOutput} />

                </Form>

            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4" className="mb-0">WALLET / VAULT UTILITY -- FUNCTION TESTING</Header>
                <Header as="h5" className="mt-2 mb-0">Vault: {String(vault.exists)} </Header>
                <Header sub color="red" className="mt-2">Testing Mnemonic -- DO NOT USE FOR ELSEWHERE</Header>
                <TextArea className="w-full mb-0 mt-2" value={testingMnemonic} />

                <Form>
                    <Form.Group widths="equal" className="mb-0">
                        <DButton content="getNewTestingMnemonic" color="orange" onClick={utilWalletSpinNewMnemonc} />
                        <DButton content="clearTestingMnemonic" color="red" onClick={() => setTestingMnemonic("")} />
                    </Form.Group>

                    <DButton basic={false} color="green" onClick={saveMnemonicAsVault} content="Save Mnemonic As New Vault" className="m-0" />

                    <Header as="h6" className="m-0 mt-2">HD Chain Functions</Header>
                    <DButton primary disabled={!testingMnemonic || !!seedBytes} content="getSeedBytesFromMnemonic" fluid onClick={getSeedBytesFromMnemonic} />
                    <DButton primary disabled={!seedBytes || !!hdChain} content="getHdChainFromSeedBytes)" fluid onClick={getHDChainFromSeedBytes} />
                    <DButton primary disabled={!hdChain || !!walletNode} content="getWalletNodeFromHdChain)" fluid onClick={getNodeFromHDChain} />

                    <Header as="h6" className="m-0 mt-2">Log</Header>
                    <DButton color="purple" className="mt-1" content="Log(SeedBytes,Chain,Wallet)" fluid onClick={() => console.log({ seedBytes: seedBytes, hdChain: hdChain, walletNode: walletNode })} />

                    <Header as="h6" className="m-0 mt-2">Cipher/Decipher Key</Header>
                    <Form.Input placeholder="Password for cipher/decipher & Save New Vault" size="mini" value={vaultPassword} onChange={e => setVaultPassword(e.target.value)} />

                    <Header as="h6" className="m-0 mt-2">Mad Wallet Instance</Header>
                    <DButton basic={false} color="purple" basic onClick={printMadWalletInstance} content="Print madWallet instance (getMadWallet)" />

                </Form>


            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4">USER ACTIONS</Header>
                TBD
            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4">MODAL ACTIONS</Header>
                <DButton content="open_GlobalErrorModalTest" onClick={() => dispatch(MODAL_ACTIONS.openGlobalErrorModal("This is a debug error!"))} />
            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4">Goto User Story</Header>
                <DButton content="New User - Recovery Flow" onClick={() => goto("/newVault/useRecoveryPhrase")} />
                <DButton content="Root Flow" onClick={() => goto("/")} />
            </Grid.Column>

        </Grid>

    )

}

const stateMap = state => ({ vault: state.vault });
export default connect(stateMap)(DebugActionPanel)
