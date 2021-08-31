import { connect } from "react-redux";
import { Grid, Table, Header } from 'semantic-ui-react';
import DebugActionPanel from "./DebugActionPanel";
import store from 'redux/store/store';
import log from 'loglevel';
import { INTERFACE_ACTIONS } from 'redux/actions/_actions';
import lstyle from './StateViewer.module.scss';

function StateViewer({ redux }) {

    const mapReduxStateToTable = () => {

        // Create array of all reducers as a table
        let tables = [];

        // Isolate reducers within connected redux state
        for (let reducer in redux) {
            let rows = [];
            // Isolate the keys of each state, ignore nesting and label as object for now -- Improve i/when f needed
            for (let key in redux[reducer]) {
                rows.push(
                    <Table.Row>
                        <Table.Cell>{key}</Table.Cell>
                        <Table.Cell>{typeof redux[reducer][key] !== "object" ? String(redux[reducer][key]) : 'object'}</Table.Cell>
                    </Table.Row>
                )
            }
            // Add the table
            tables.push(<>
                <Header as="h3">{reducer}</Header>
                <Table>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
            </>)
        }
        return tables;
    }

    return !redux.interface.showDebug ? null : (

        <Grid padded className={lstyle.debugInterface}>

            <Grid.Column width={16}>
                <Header as="h2">State Actions</Header>
                <DebugActionPanel />
            </Grid.Column>

            <Grid.Column width={16}>
                <Header as="h2"> Redux State Debug View </Header>
                {mapReduxStateToTable()}
            </Grid.Column>

        </Grid>

    )

}

const stateMap = state => ({ redux: { ...state } });
export default connect(stateMap)(StateViewer);

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
