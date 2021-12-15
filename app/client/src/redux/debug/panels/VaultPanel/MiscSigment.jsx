import React from 'react';
import { Form, Header, Message, Segment } from 'semantic-ui-react';
import { useSelector } from 'react-redux';
import utils from 'util/_util';

export default function MiscSegment() {

    /* State */
    const vault = useSelector(s => s.vault);
    const [privK, setPrivK] = React.useState("");
    const [derived, setDerived] = React.useState(["", ""]);
    const [loading, setLoading] = React.useState(false);

    /* Functions */
    const deriveKeys = async () => {
        try {
            setLoading(true);
            let [secp256k1, bn] = await utils.wallet.getPubKeysFromPrivKey(privK)
            setDerived([secp256k1, bn]);
            setLoading(false);
            console.log({
                SECP256K1: secp256k1,
                BN: bn
            })
        } catch (ex) {
            setLoading(false);
            console.error(ex);
        }
    }

    return (
        <Segment>

            <Header as="h5">Derive Public Keys</Header>

            <Form size="mini">

                <Form.Input
                    placeholder="Private Key"
                    label="Private Key"
                    value={privK}
                    onChange={e => setPrivK(e.target.value)}
                    action={{
                        content: "Derive & Log PubKeys",
                        onClick: deriveKeys,
                        size: "mini",
                        loading: loading,
                    }}
                />

                <Form.Group>
                    {[...vault.wallets.internal, ...vault.wallets.external].map(wallet => {
                        return <Form.Button content={wallet.name} size="mini" onClick={() => setPrivK(wallet.privK)}/>
                    })}
                </Form.Group>

            </Form>

            <Message size="mini" className="p-3">
                <div>
                    <span className="font-bold">SECP256K1:</span> {derived[0]}
                </div>
                <div>
                    <span className="font-bold">BN:</span> {derived[1]}
                </div>
            </Message>

        </Segment>
    );

}