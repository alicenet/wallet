import React from 'react';
import { Segment, Form, Header, Grid, TextArea, Icon } from 'semantic-ui-react';
import { DButton } from '../../DebugPanel';
import util from 'util/_util';
import { VAULT_ACTIONS } from 'redux/actions/_actions';
import { useDispatch } from 'react-redux';

export default function MnemonicSegment() {

    const dispatch = useDispatch();

    ////////////////////////////
    /*          State         */
    ////////////////////////////
    const [hdChain, setHdChain] = React.useState(false);
    const [seedBytes, setSeedBytes] = React.useState(false);
    const [testingMnemonic, setTestingMnemonic] = React.useState("unknown hold print furnace paper walk crucial junk country list phrase because");
    const [vaultPassword, setVaultPassword] = React.useState("testing");
    const [walletNode, setWalletNode] = React.useState(false);
    const derivationChainComplete = seedBytes && hdChain && walletNode;

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
        setWalletNode(await util.wallet.getHDWalletNodeFromHDChain(hdChain, 0));
    }

    /////////////////////////
    // Vault     Functions //
    /////////////////////////
    const saveMnemonicAsVault = async () => {
        if (!vaultPassword) { return setVaultPassword("REQUIRED FOR VAULT SET!"); }
        await dispatch(VAULT_ACTIONS.generateNewSecureHDVault(testingMnemonic, vaultPassword))
    }

    // Prop Shorthands
    const basPriMini = { basic: true, primary: true, size: "mini" };
    const basMini = { basic: true, size: "mini" };

    ////////////
    // RETURN //
    ////////////

    return (
        <Segment>

            <Header as="h3" className="m-0" content="Mnemonic Tools" />

            <Grid>
                <Grid.Column width={16} className="pb-0">
                </Grid.Column>
                <Grid.Column width={8}>
                    <TextArea className="w-full mb-0 mt-1" value={testingMnemonic} />
                    <span className="text-red-600 text-xs uppercase mt-2">Testing Mnemonic -- DEBUG & TESTING USE ONLY <br/> <span className="font-black">DO NOT USE ANYWHERE ELSE!</span></span>
                </Grid.Column>
                <Grid.Column width={8} verticalAlign="top">
                    <Form>
                        <Form.Group widths="equal" className="mb-0">
                            <DButton content="getNewTestingMnemonic" color="orange" onClick={utilWalletSpinNewMnemonc} />
                            <DButton content="clearTestingMnemonic" color="red" onClick={() => setTestingMnemonic("")} />
                        </Form.Group>
                        <Form.Group widths="equal" className="mb-0 flex justify-center items-end">
                            <Form.Input value={vaultPassword} onChange={e => setVaultPassword(e.target.value)} size="mini" className="m-0 mt-2" label="Vault Password" />
                            <Form.Button {...basMini} fluid color="green" onClick={saveMnemonicAsVault} content="Save As New Vault" className="m-0 mt-3" />
                        </Form.Group>
                    </Form>
                </Grid.Column>
                <Grid.Column width={16} className="pt-0">
                    <Header sub className="mt-0">Derivation - HD Chain Testing ( Uses Above Mnemonic ) </Header>
                    <Form className="mt-2">
                        <Form.Group width="equal">
                            <Form.Button {...basPriMini} disabled={!testingMnemonic || !!seedBytes} content="getSeedBytesFromMnemonic" fluid onClick={getSeedBytesFromMnemonic} />
                            <Form.Button {...basPriMini} disabled={!seedBytes || !!hdChain} content="getHdChainFromSeedBytes)" fluid onClick={getHDChainFromSeedBytes} />
                            <Form.Button {...basPriMini} disabled={!hdChain || !!walletNode} content="getWalletNodeFromHdChain)" fluid onClick={getNodeFromHDChain} />
                            <Form.Button {...basMini} color={derivationChainComplete ? "green" : "orange"} content={derivationChainComplete ? "Pass" : "Waiting"} labelPosition="left" icon={<Icon name={derivationChainComplete ? "checkmark" : "close"} />} />
                        </Form.Group>
                        <Form.Button {...basMini} fluid color="purple" className="mt-1" content="Log SeedBytes, Chain, and Wallet" onClick={() => console.log({ seedBytes: seedBytes, hdChain: hdChain, walletNode: walletNode })} />
                    </Form>
                </Grid.Column>
            </Grid>

        </Segment>
    )

}