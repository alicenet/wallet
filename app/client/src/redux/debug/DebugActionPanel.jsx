import React from 'react';
import { connect } from "react-redux";
import { Input, Button, Grid, Header, Container, TextArea, Form, FormButton } from 'semantic-ui-react';
import { USER_ACTIONS, MODAL_ACTIONS } from '../actions/_actions';

import util from 'util/_util';

import { utilityActons as utilStoreHelper } from 'store/electronStoreHelper';

function DebugActionPanel({ dispatch }) {

    const [vaultExists, setVaultExists] = React.useState("unknown");
    const [vaultWasntFound, setVaultWasntFound] = React.useState(false);
    const [testingMnemonic, setTestingMnemonic] = React.useState("unknown hold print furnace paper walk crucial junk country list phrase because");

    const [valueToWrite, setValueToWrite] = React.useState("");
    const [customStorageKey, setCustomStorageKey] = React.useState("testKey")
    const [customValueRead, setCustomValueRead] = React.useState("testKey");
    const [storeReadOutput, setStoreReadOutput] = React.useState("_");

    const DButton = (props) => <Button basic size="mini" {...props} className="m-1 ml-0" />

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
    }

    const getHDChainFromTestMneominc = async () => {
        util.wallet.getHDChainFromMnemonic(testingMnemonic);
    }

    const getNodeFromHDChain = async () => {
        let hdChain = await util.wallet.getHDChainFromMnemonic(testingMnemonic);
        util.wallet.getHDWalletNodeFromHDChain(hdChain, 0);
    }


    //////////////////////
    // Store Operations //
    //////////////////////
    const readValue = async () => {
        let read = await utilStoreHelper.readPlainValueFromStore(customValueRead)
        if (read.error) { read = read.error } 
        setStoreReadOutput(read);
    }

    const writeValue = async () => {
        utilStoreHelper.writePlainValueToStore(customStorageKey, valueToWrite);
    }

    return (

        <Grid>

            <Grid.Column width={8}>
                <Header as="h4">ELCETRON STORE ACTIONS</Header>
                <DButton content="electron_readVal(testKey)" onClick={() => utilStoreHelper.readPlainValueFromStore("testKey")} />
                <DButton content="electron_writeVal(testVal)" onClick={() => utilStoreHelper.writePlainValueToStore("testKey", "testVal")} />
                <DButton content="electron_writeSecureVal(EtestVal)" onClick={() => utilStoreHelper.writeEncryptedToStore("EtestKey", "EtestVal", "test")} />
                <DButton content="electron_readEtestVal" onClick={() => utilStoreHelper.readPlainValueFromStore("EtestKey")} />
                <DButton content="electron_decipherEtestVal" onClick={() => utilStoreHelper.readEncryptedValueFromStore("EtestKey", "test")} />

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
                    <TextArea fluid className="mt-1" value={storeReadOutput}/ >

                </Form>

            </Grid.Column>

            <Grid.Column width={8}>
                <Header as="h4" className="mb-0">WALLET UTILITY -- FUNCTION TESTING</Header>
                <Header sub color="red">Testing Mnemonic -- DO NOT USE FOR ANYTHING OTHER THAN TESTING</Header>
                <TextArea DButton className="w-full mb-0 mt-2" value={testingMnemonic} />
                <Header sub className="mt-0"> Functions </Header>
                <DButton content="walutil_spinNewTestingMnemonic" color="orange" onClick={utilWalletSpinNewMnemonc} />
                <DButton content="walutil_run=>GenerateBip39Mnemonic" onClick={util.wallet.generateBip39Mnemonic} />
                <DButton content="walutil_run=>getHDChainFromMnemonic(testingMnemonic)" fluid onClick={getHDChainFromTestMneominc} />
                <DButton content="walutil_run=>getHDWalletNodeFromHDChain(testingMnemonic=>HDChain)" fluid onClick={getNodeFromHDChain} />
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

export default connect()(DebugActionPanel)
