import React from 'react';
import { Grid, Menu } from 'semantic-ui-react';
import VaultSegment from './VaultSegment.jsx';
import MnemonicSegment from './MnemonicSegment.jsx';
import OptOutSegment from './OptOutSegment.jsx';

export default function VaultPanel() {

    const [activeBlocks, setActiveBlocks] = React.useState([1]);

    const isActiveBlock = (index) => activeBlocks.filter(e => e === index).length > 0;

    const handleClick = (e, props) => {
        const { index } = props;
        // Just toggle instead for now
        return setActiveBlocks([index])
    }

    const visibilityShim = (active, content) => active ? content : null;

    return (

        <Grid className="mt-1">

            <Grid.Column width={16}>
                <Menu>
                    <Menu.Item active={isActiveBlock(0)} index={0} onClick={handleClick} content="Mnemonic" />
                    <Menu.Item active={isActiveBlock(1)} index={1} onClick={handleClick} content="Vault/Wallets" />
                    <Menu.Item active={isActiveBlock(2)} index={2} onClick={handleClick} content="Optout/Wallets" />
                </Menu>
            </Grid.Column>

            {/* Mnemonic Segment */}
            {visibilityShim(isActiveBlock(0), (
                <Grid.Column width={16} >
                    <MnemonicSegment />
                </Grid.Column>
            ))}

            {/* Vault Segment */}
            {visibilityShim(isActiveBlock(1), (
                <Grid.Column width={16}>
                    <VaultSegment />
                </Grid.Column>
            ))}

            {/* Vault Segment */}
            {visibilityShim(isActiveBlock(2), (
                <Grid.Column width={16}>
                    <OptOutSegment />
                </Grid.Column>
            ))}

        </Grid>

    )

}