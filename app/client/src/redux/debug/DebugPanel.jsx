import React from "react";
import DebugProvider, {
    DebugContext,
    GetMockContextSetterByKey,
    views,
} from "./DebugContext.jsx";
import { Grid, Form } from "semantic-ui-react";

import DebugMenu from "./DebugMenu.jsx";
import ReduxState from "./panels/ReduxState.jsx";
import VaultPanel from "./panels/VaultPanel/_VaultPanel.jsx";
import ElectronPanel from "./panels/ElectronStorePanel.jsx";
import UserStoriesPanel from "./panels/UserStoriesPanel.jsx";
import Web3Panel from "./panels/Web3Panel.jsx";
import AliceNetPanel from "./panels/MadNetPanel.jsx";

import store from "redux/store/store";
import { useDispatch, useSelector } from "react-redux";
import { INTERFACE_ACTIONS, USER_ACTIONS } from "redux/actions/_actions";

import lstyle from "./DebugPanel.module.scss";
import log from "loglevel";
import ToastPanel from "./panels/ToastPanel.jsx";

export const DButton = (props) => (
    <Form.Button
        basic
        size="mini"
        fluid
        {...props}
        className={"m-1 ml-0 " + props.className}
    />
);

/** Provide context to DebugPanel  */
export default function DebugRoot() {
    const showDebug = useSelector((state) => state.interface.showDebug);
    return <DebugProvider>{showDebug && <DebugPanel />}</DebugProvider>;
}

/** Root Debug Panel */
function DebugPanel() {
    const dispatch = useDispatch();
    const debugContext = React.useContext(DebugContext);
    const [currentView] = GetMockContextSetterByKey(
        debugContext,
        "currentView"
    );

    const getCurrentView = () => {
        switch (currentView) {
            case views.REDUX_STATE:
                return <ReduxState />;
            case views.VAULT_WALLETS:
                return <VaultPanel />;
            case views.ELECTRON_STORE:
                return <ElectronPanel />;
            case views.USER_STORIES:
                return <UserStoriesPanel />;
            case views.WEB3:
                return <Web3Panel />;
            case views.ALICENET:
                return <AliceNetPanel />;
            case views.TOAST:
                return <ToastPanel />;
            default:
                return null;
        }
    };

    /* Check if user has a vault behind the scenes */
    React.useEffect(() => {
        const checkForAccount = async () => {
            await dispatch(USER_ACTIONS.initialUserAccountCheck());
        };
        checkForAccount();
    }, [dispatch]);

    return (
        <Grid
            padded
            className={[
                lstyle.debugInterface,
                "absolute top-0 flex flex-col",
            ].join(" ")}
            verticalAlign="top"
        >
            <Grid.Column width={16} className="pb-0 h-20 bg-gray-200">
                <DebugMenu />
            </Grid.Column>
            <Grid.Column
                width={16}
                verticalAlign="top"
                className={lstyle.contentColumn}
            >
                {getCurrentView()}
            </Grid.Column>
        </Grid>
    );
}

/////////////////////////////
// External Event Managers //
/////////////////////////////

/**
 * Adds the event lister to document if "add", or if "remove" removes it
 * @param {String} type -- Type of listener handle :: "remove" || "add"
 * @returns
 */
export function handleDebugListener(type) {
    if (process.env.REACT_APP_DEBUG === "TRUE") {
        return type === "add"
            ? document.addEventListener("keydown", _debugToggle)
            : document.removeEventListener("keydown", _debugToggle);
    } else {
        return;
    }
}

/**
 * If ctr+shift+z is pressed during DEBUG mode as defined in process.env, toggle the redux state viewer
 * @param {Event} e - KeyboardEvent()
 */
function _debugToggle(e) {
    if (e.ctrlKey && e.shiftKey && e.code === "KeyZ") {
        log.debug(
            "DebugStoreCall => Set debugView: ",
            !store.getState().interface.showDebug
        );
        store.dispatch(INTERFACE_ACTIONS.DEBUG_toggleShowDebug());
    }
}
