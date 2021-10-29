import React from 'react';
import { Container } from 'semantic-ui-react';
import { Router as Router, Route, Switch } from 'react-router-dom';
import DebugPanel, { handleDebugListener } from 'redux/debug/DebugPanel';
import { ToastContainer } from 'react-toastify';
import { history } from 'history/history';
import NetworkStatusIndicator from 'components/overlays/NetworkStatusIndicator';

import util from 'util/_util';

// User Story Components
import * as Hubs from 'stories/hubs/_hubs';
import * as AddWallet from 'stories/addWallet/_addWallet';
import * as Settings from 'stories/settings/_settings';
import * as Transactions from 'stories/transactions/_transactions';
import * as NewVaultFlows from 'stories/newVault/_newVault';
import * as OptOutFlow from 'stories/optOut/_optOut';
import * as ReturningUserLoadFlows from 'stories/returningUserLoad/_returnUserLoad';
import * as WalletActionModals from 'modals/_walletActionModals';

// Global Modals
import PasswordRequestModal from 'components/modals/PasswordRequestModal';
import { SelectedWalletProvider } from 'context/Hub_SelectedWalletContext';

/**
 * Main App Entrypoint
 */
function App() {

    /* Redux State -- Debug Handlers */
    React.useEffect(() => {
        handleDebugListener("add");
        return () => handleDebugListener("remove");
    }, [])

    const DefaultRoutes = () => {
        return (
            <>

                <Route exact path="/" component={Hubs.NewUserHub} />

                {/* New User Hub -- Send after determining no vault exists */}
                <Route exact path="/newUserHub" component={Hubs.NewUserHub} />

                {/* New User - Vault Opt Out Flow */}
                <Route exact path="/optOut/disclaimer" component={OptOutFlow.VaultOptOutDisclaimer} />
                <Route exact path="/optOut/createKeystore" component={OptOutFlow.CreateAKeystore} />
                <Route exact path="/optOut/useExistingKeystore" component={OptOutFlow.UseExistingKeystore} />

                {/* New Vault User Flow */}
                <Route exact path="/newVault/createVault" component={NewVaultFlows.CreateVault} />
                <Route exact path="/newVault/getNewSeedPhrase" component={NewVaultFlows.GetNewSeedPhrase} />
                <Route exact path="/newVault/verifySeedPhrase" component={NewVaultFlows.VerifySeedPhrase} />
                <Route exact path="/newVault/chooseEllipticCurve" component={NewVaultFlows.ChooseEllipticCurve} />
                <Route exact path="/newVault/secureNewVault" component={NewVaultFlows.SecureNewVault} />

                {/* Restore Vault With Seed User Flow */}
                <Route exact path="/newVault/useRecoveryPhrase" component={NewVaultFlows.EnterRecoveryPhrase} />
                <Route exact path="/newVault/chooseRecoveryEllipticCurve" component={NewVaultFlows.ChooseRecoveryEllipticCurve} />

                {/* Returning User Load */}
                <Route exact path="/returningUserLoad/hasExistingVault" component={ReturningUserLoadFlows.HasExistingVault} />
                <Route exact path="/returningUserLoad/hasKeystores" component={ReturningUserLoadFlows.HasExistingKeystores} />

                {/* Wallet Hub -- Send here if vault exists */}
                <SelectedWalletProvider>
                    <Route exact path="/hub" component={Hubs.ReturningUserHub} />
                </SelectedWalletProvider>

                {/* Add Wallet -- Add Wallet Menu && Screens */}
                <Route exact path="/addWallet/menu" component={AddWallet.AddWalletMenu} />
                <Route exact path="/addWallet/generate" component={AddWallet.GenerateWallet} />
                <Route exact path="/addWallet/importKeystore" component={AddWallet.ImportKeystore} />
                <Route exact path="/addWallet/importPrivateKey" component={AddWallet.ImportPrivateKey} />
                <Route exact path="/addWallet/verify" component={AddWallet.VerifyImport} />

                {/* Construct Hub */}
                <Route exact path="/transactions" component={Transactions.Construct} />

                {/* Settings */}
                <Route exact path="/wallet/settings" component={Settings.Settings} />
                <Route exact path="/wallet/advancedSettings" component={Settings.AdvancedSettings} />

            </>
        )
    }

    const DebugTools = () => {
        return util.generic.isDebug ? (<>
            <DebugPanel />
        </>) : null
    }

    return (
        <Container fluid className="h-full w-full justify-center items-center">
            <Router history={history}>
                <Switch>
                    <DefaultRoutes />
                </Switch>

                <DebugTools />

                <NetworkStatusIndicator />
                <ToastContainer position="bottom-right" />

                <PasswordRequestModal />
                <WalletActionModals.RenameWalletModal />
                <WalletActionModals.RemoveWalletModal />
                <WalletActionModals.ExportPrivateKeyModal />

            </Router>
        </Container>
    );
}

export default App;
