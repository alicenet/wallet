import React from 'react';
import { Sidebar, Header, Button, Grid, Icon, Image } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { useBoolToggler } from 'hooks/_hooks.js';
import MadIcon from "../../Assets/icon.png";
import PropTypes from 'prop-types';

/**
 * Provide wallet tab as a drawer to the passed Component
 * @param { Function } Component - Functional React Component to act as HoC for.
 * @param { Boolean } isOpen - Should the wallet drawer be open by default?
 * @returns { Function } - Return same component with toggleWalletDrawer as a prop for opening/closing the wallet drawer
 */
export default function withWalletDrawer(Component, isOpen = false) {
    function ComponentWithDrawer({ wallets, ...props }) {

        const [isVisible, toggleSetIsVisible] = useBoolToggler(isOpen);

        const addWallet = () => {
            console.log("TBD: Add a wallet via redux actions!")
        }

        const WalletButtons = () => {
            const AddWalletButton = <Button key="add_btn" fluid size="mini" color="green" basic content="Add Wallet" icon={<Icon name="plus" className="bg-transparent" />} labelPosition="right" onClick={addWallet} />
            const CloseTabButton = <Button key="close_btn" fluid size="mini" color="red" basic content={"Close"} onClick={() => toggleSetIsVisible()} className="mt-4" />
            const WalletButtons = wallets.internal.map(wallet => <Button key={wallet.id} content={wallet.name} onClick={() => console.log('hit')} />);
            return [WalletButtons, AddWalletButton, CloseTabButton];
        }

        return (

            <Sidebar.Pushable>
                <Sidebar
                    as={Grid}
                    animation='push'
                    icon='labeled'
                    visible={isVisible}
                    className="bg-gray-100"
                    onHide={() => toggleSetIsVisible(false)}
                >

                    <Grid.Column width={16} textAlign="center">
                        <Header as="h3" className="mt-4">
                            Wallets<br />
                            <Image src={MadIcon} size="mini" />
                        </Header>
                    </Grid.Column>

                    <Grid.Column width={16} textAlign="center">
                        <WalletButtons />
                    </Grid.Column>


                </Sidebar>

                <Sidebar.Pusher className="flex justify-center items-center">
                    <Component {...props} toggleWalletDrawer={(b) => toggleSetIsVisible(b)} />
                </Sidebar.Pusher>

            </Sidebar.Pushable>

        )
    }

    ComponentWithDrawer.propTypes = {
        wallets: PropTypes.object.isRequired,
    }

    const stateMap = state => ({ wallets: state.vault.wallets });
    return connect(stateMap)(ComponentWithDrawer);

}

withWalletDrawer.propTypes = {
    Component: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
}