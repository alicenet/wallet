import log from 'loglevel';
import store from 'redux/store/store';
import { useSelector, useDispatch } from "react-redux";
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import DebugProvider from './DebugContext.jsx';
import { Grid, Header } from 'semantic-ui-react'
import lstyle from './DebugPanel.module.scss';

/** Provide context to DebugPanel  */
export default function DebugRoot() {
    const showDebug = useSelector(state => (state.interface.showDebug));
    return showDebug ? (
        <DebugProvider>
            <DebugPanel />
        </DebugProvider>
    ) : null
}

/** Root Debug Panel */
function DebugPanel() {

    return (

        <Grid padded className={lstyle.debugInterface}>

            <Grid.Column width={16}  >
                <Header textAlign="left">Debug Panel</Header>
            </Grid.Column>

        </Grid>

    )

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
        return type === "add" ? document.addEventListener("keydown", _debugToggle) : document.removeEventListener("keydown", _debugToggle);
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
        log.debug("DebugStoreCall => Set debugView: ", !store.getState().interface.showDebug)
        store.dispatch(INTERFACE_ACTIONS.DEBUG_toggleShowDebug());
    }
}
