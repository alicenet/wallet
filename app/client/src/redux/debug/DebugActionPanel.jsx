import React from 'react';
import { connect } from "react-redux";
import { Input, Button, Grid, Header, Container, TextArea, Form, FormButton } from 'semantic-ui-react';
import { USER_ACTIONS, MODAL_ACTIONS, VAULT_ACTIONS } from 'redux/actions/_actions';

import util from 'util/_util';

import { electronStoreUtilityActons as utilStoreHelper } from 'store/electronStoreHelper';

function DebugActionPanel({ dispatch, vault }) {

    console.log(vault);

    const [vaultExists, setVaultExists] = React.useState("unknown");
    const [vaultWasntFound, setVaultWasntFound] = React.useState(false);
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

    ////////////////////////////
    /*      Vault Actions     */
    ////////////////////////////
    const checkVaultExists = () => {
        if (false) {
            setVaultExists(true);
        }
        else {
            setVaultExists(false);
            setVaultWasntFound(true);
            setTimeout(() => { setVaultExists("unknown") }, 2000)
        }
    }

    // testKey, testVal  :: EtestKey, EtestVal

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
    const readValue = async () => {
        let read = await utilStoreHelper.readPlainValueFromStore(customValueRead)
        if (read.error) { read = read.error }
        return setStoreReadOutput(read);
    }

    const writeValue = async () => {
        if (!valueToWrite || !customStorageKey) { return console.warn("Fill out key && value for write debugging!") }
        utilStoreHelper.writePlainValueToStore(customStorageKey, valueToWrite);
    }

    const saveMnemonicAsVault = async () => {
        if (!vaultPassword) { return setVaultPassword("REQUIRED!"); }
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

                <Button size="mini" fluid content="electron_DELETE_STORE_NO_CONFIRM" onClick={() => console.log("DELSTORE")} color="red" className="mt-4" />

                <Header as="h5">Custom Store Write/Reads</Header>

                <Form>
                    <Form.Group widths="equal">
                        <Form.Input value={customStorageKey} size="mini" placeholder="Storage Key To Write" onChange={e => setCustomStorageKey(e.target.value)} />
                        <Form.Input value={valueToWrite} size="mini" placeholder="Storage Value To Write" onChange={e => setValueToWrite(e.target.value)} />
                    </Form.Group>

                    <FormButton fluid size="mini" content="Write" onClick={writeValue} />

                    <Form.Group widths="equal">
                        <Form.Input value={customValueRead} onChange={e => setCustomValueRead(e.target.value)} size="mini" placeholder="PlainReadKey" />
                        <FormButton fluid size="mini" content="Read" onClick={readValue} />
                    </Form.Group>

                    <Header as="h6" className="mt-1 mb-0">Read Output</Header>
                    <TextArea fluid className="mt-1" value={typeof storeReadOutput === "object" ? JSON.stringify(storeReadOutput) : storeReadOutput} />

                </Form>

            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4" className="mb-0">WALLET UTILITY -- FUNCTION TESTING</Header>
                <Header sub color="red">Testing Mnemonic -- DO NOT USE FOR ANYTHING OTHER THAN TESTING</Header>
                <TextArea DButton className="w-full mb-0 mt-2" value={testingMnemonic} />
                <Header sub className="mt-0"> Functions </Header>

                <Form>
                    <Form.Group widths="equal">
                        <DButton content="setNewTestingMnemonic" color="orange" onClick={utilWalletSpinNewMnemonc} />
                        <DButton content="clearTestingMnemonic" color="red" onClick={() => setTestingMnemonic("")} />
                    </Form.Group>

                    <DButton primary disabled={!testingMnemonic || !!seedBytes} content="getSeedBytesFromMnemonic" fluid onClick={getSeedBytesFromMnemonic} />
                    <DButton primary disabled={!seedBytes || !!hdChain} content="getHdChainFromSeedBytes)" fluid onClick={getHDChainFromSeedBytes} />
                    <DButton primary disabled={!hdChain || !!walletNode} content="getWalletNodeFromHdChain)" fluid onClick={getNodeFromHDChain} />

                    <DButton color="purple" className="mt-4" content="Log(SeedBytes,Chain,Wallet)" fluid onClick={() => console.log({ seedBytes: seedBytes, hdChain: hdChain, walletNode: walletNode })} />

                    <Form.Input placeholder="Password for vault" size="mini" value={vaultPassword} onChange={e => setVaultPassword(e.target.value)} />

                    <DButton basic={false} color="green" onClick={saveMnemonicAsVault} content="Save Mnemonic As New Vault" />

                    <DButton basic={false} color="green" onClick={printMadWalletInstance} content="Print madWallet instance (getMadWallet)" />

                </Form>


            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4">USER ACTIONS</Header>
                <DButton content="user_lockAccount" onClick={() => dispatch(USER_ACTIONS.lockAccount())} />
                <DButton content="user_unlockAccount" onClick={() => dispatch(USER_ACTIONS.unlockAccount())} className="mt-2 md:mt-0" />
            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4">MODAL ACTIONS</Header>
                <DButton content="open_GlobalErrorModalTest" onClick={() => dispatch(MODAL_ACTIONS.openGlobalErrorModal("This is a debug error!"))} />
            </Grid.Column>

            <Grid.Column width={16}>

                <Header as="h4">VAULT MANAGEMENT</Header>

                <DButton
                    content={vaultExists === "unknown" ? "Check For Vault" : vaultExists ? "Vault Exists" : "Not Found!"}
                    color={vaultExists === "unknown" ? "orange" : vaultExists ? "green" : "red"}
                    onClick={checkVaultExists}
                />

                {vaultWasntFound && vaultExists !== true ? (<>
                    <Input size="mini" placeholder="New Vault Password" action={{ content: "CreateNew", size: "mini" }} className="p-2" />
                </>) : null}

                {vaultExists === true ? (
                    <Input disabled={!vaultExists} size="mini" placeholder="Vault Password" action={{ content: "Unlock", size: "mini", disabled: !vaultExists }} className="p-2" />
                ) : null}

                {vaultExists === true ? (
                    <DButton color="red" content="Delete Vault" />
                ) : null}

                {vaultExists !== true && vaultWasntFound ? (<>
                    <Header sub>New Vault Seed:</Header>
                    <Container fluid className="text-xs">
                        Generate a new vault to show its seed. It will encrypted and stored immediately with the above password using AES-512.
                    </Container>
                </>
                ) : null}


            </Grid.Column>

        </Grid>

    )

}

const stateMap = state => ({ vault: state.vault });
export default connect(stateMap)(DebugActionPanel)
