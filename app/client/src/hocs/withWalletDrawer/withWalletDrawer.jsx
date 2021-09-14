import React from 'react';
import {Button, ButtonGroup, Grid, Header, Icon, Image, Sidebar} from 'semantic-ui-react';
import {connect} from 'react-redux';
import {useBoolToggler} from 'hooks/_hooks.js';
import MadIcon from "../../Assets/icon.png";
import PropTypes from 'prop-types';

/**
 * Provide wallet tab as a drawer to the passed Component
 * @param { Function } Component - Functional React Component to act as HoC for.
 * @param { Boolean } isOpen - Should the wallet drawer be open by default?
 * @returns { Function } - Return same component with toggleWalletDrawer as a prop for opening/closing the wallet drawer
 */
export default function withWalletDrawer(Component, isOpen = false) {
    function ComponentWithDrawer({wallets, dispatch, ...props}) {

        const [isVisible, toggleSetIsVisible] = useBoolToggler(isOpen);
        const closeDrawer = () => toggleSetIsVisible(false);

        const [activeWallet, setActiveWallet] = React.useState(false);

        const clickWalletButton = (wallet) => {
            setActiveWallet(wallet.initId);
            console.log("Set active wallet to, " + wallet.initId);
        }

        const addWallet = async () => {
            // CAT_TODO: Update to history.push after vault debugging
            console.log("This needs updated to push to walletAdd UserStory");
        }

        const WalletButtons = () => {
            const genWalletButtonProps = (wallet) => ({
                onClick: () => clickWalletButton(wallet),
                content: wallet.name,
                key: wallet.initId,
                disabled: activeWallet === wallet.initId,
                basic: true,
                className: "mt-2",
                color: "grey",
                fluid: true,
                icon: "id card outline",
                size: "small"
            });

            const WalletButtons = wallets.internal.map(wallet => <Button key={wallet.initId} {...genWalletButtonProps(wallet)} />);

            const walletActionProps = {basic: true, size: "mini"}
            const WalletActions = <ButtonGroup key="actions" size="mini" className="flex justify-between align-between mt-8"
                                               buttons={[
                                                   {
                                                       onClick: closeDrawer,
                                                       className: "w-0.5",
                                                       color: "grey",
                                                       icon: "angle double left",
                                                       key: "close_btn", ...walletActionProps
                                                   },
                                                   {
                                                       onClick: addWallet,
                                                       color: "green",
                                                       content: "Add Wallet",
                                                       icon: <Icon name="plus" className="bg-transparent"/>,
                                                       key: "add_btn",
                                                       labelPosition: "right", ...walletActionProps
                                                   }
                                               ]}
            />

            return [WalletButtons, WalletActions]
        }

        return (

            <Sidebar.Pushable>
                <Sidebar
                    as={Grid}
                    animation='overlay'
                    icon='labeled'
                    visible={isVisible}
                    className="bg-gray-100"
                    onHide={() => toggleSetIsVisible(false)}
                >

                    <Grid.Column width={16} textAlign="center">
                        <Header as="h3" className="flex flex-col items-center mt-4">
                            Wallets
                            <Image src={MadIcon} size="mini"/>
                        </Header>
                    </Grid.Column>

                    <Grid.Column width={16} textAlign="center">
                        <WalletButtons/>
                    </Grid.Column>

                </Sidebar>

                <Sidebar.Pusher className="flex justify-center items-center" dimmed={isVisible}>
                    <Component {...props} toggleWalletDrawer={(b) => toggleSetIsVisible(b)}/>
                </Sidebar.Pusher>

            </Sidebar.Pushable>

        )
    }

    ComponentWithDrawer.propTypes = {
        wallets: PropTypes.object.isRequired,
    }

    const stateMap = state => ({wallets: state.vault.wallets});
    return connect(stateMap)(ComponentWithDrawer);

}

withWalletDrawer.propTypes = {
    Component: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
}
