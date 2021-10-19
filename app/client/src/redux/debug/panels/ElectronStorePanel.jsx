import React from 'react';
import { Segment, Form, Header, Button, TextArea } from 'semantic-ui-react';
import { electronStoreUtilityActons } from 'store/electronStoreHelper.js';

export default function ElectronStorePanel() {

    // State

    const [valueToWrite, setValueToWrite] = React.useState("");
    const [customStorageKey, setCustomStorageKey] = React.useState("testKey")
    const [customValueRead, setCustomValueRead] = React.useState("testKey");
    const [storeReadOutput, setStoreReadOutput] = React.useState("_");
    const [vaultPassword, setVaultPassword] = React.useState("testing");

    // Component

    const DButton = (props) => <Form.Button basic size="mini" fluid {...props} className={"m-1 ml-0 " + props.className} />

    //////////////////////
    // Store Operations //
    //////////////////////
    const deleteStore = async () => {
        await electronStoreUtilityActons.completelyDeleteElectronStore();
        window.location.reload(true);
    }

    const readValue = async () => {
        let read = await electronStoreUtilityActons.readPlainValueFromStore(customValueRead)
        if (read.error) { read = read.error }
        return setStoreReadOutput(read);
    }

    const readSecure = async () => {
        if (!vaultPassword) { return setVaultPassword("REQUIRED FOR READ!"); }
        let read = await electronStoreUtilityActons.readEncryptedValueFromStore(customValueRead, vaultPassword);
        if (read.error) { read = read.error }
        return setStoreReadOutput(read);
    }

    const writeValue = async () => {
        if (!valueToWrite || !customStorageKey) { return console.warn("Fill out key && value for write debugging!") }
        electronStoreUtilityActons.writePlainValueToStore(customStorageKey, valueToWrite);
    }

    return (

        <div>

            <Segment>

                <Header as="h4">ELECTRON STORE ACTIONS</Header>

                <Form>
                    <Form.Group widths="equal">
                        <DButton content='read("testKey")' onClick={() => electronStoreUtilityActons.readPlainValueFromStore("testKey")} />
                        <DButton content='write("testKey", "testVal")' onClick={() => electronStoreUtilityActons.writePlainValueToStore("testKey", "testVal")} />
                    </Form.Group>
                    <Form.Group widths="equal">
                        <DButton content='secWrite("EtestKey", "EtestVal")' onClick={() => electronStoreUtilityActons.writeEncryptedToStore("EtestKey", "EtestVal", "test")} />
                        <DButton content='read("EtestVal"' onClick={() => electronStoreUtilityActons.readPlainValueFromStore("EtestKey")} />
                    </Form.Group>

                    <DButton content='decipher("EtestVal"' onClick={() => electronStoreUtilityActons.readEncryptedValueFromStore("EtestKey", "test")} />

                </Form>

                <Button size="mini" fluid content="electron_DELETE_STORE_NO_CONFIRM__WITH_HARD_REFRESH" onClick={deleteStore} color="red" className="mt-4" />

                <Header as="h5">Custom Store Write/Reads</Header>

                <Form>
                    <Form.Group widths="equal">
                        <Form.Input value={customStorageKey} size="mini" placeholder="Storage Key To Write" onChange={e => setCustomStorageKey(e.target.value)} />
                        <Form.Input value={valueToWrite} size="mini" placeholder="Storage Value To Write" onChange={e => setValueToWrite(e.target.value)} />
                    </Form.Group>

                    <Form.Button fluid size="mini" content="Write" onClick={writeValue} />

                    <Form.Group widths="equal">
                        <Form.Input value={customValueRead} onChange={e => setCustomValueRead(e.target.value)} size="mini" placeholder="PlainReadKey" />
                        <Button.Group size="mini">
                            <Form.Button fluid size="mini" content="Read" onClick={readValue} />
                            <Form.Button fluid size="mini" content="Decipher" onClick={readSecure} className="ml-2" />
                        </Button.Group>
                    </Form.Group>

                    <Header as="h6" className="mt-1 mb-0">Read Output</Header>
                    <TextArea className="mt-1" value={typeof storeReadOutput === "object" ? JSON.stringify(storeReadOutput) : storeReadOutput} />


                    <Header as="h6" className="m-0 mt-2">Cipher/Decipher Key</Header>
                    <Form.Input placeholder="Password for cipher/decipher & Save New Vault" size="mini" value={vaultPassword} onChange={e => setVaultPassword(e.target.value)} />


                </Form>

            </Segment>

        </div>

    )

}