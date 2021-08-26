import { connect } from "react-redux";
import { Grid, Table, Header } from 'semantic-ui-react';
import DebugActionPanel from "./DebugActionPanel";

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
            tables.push(
                <Table>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
            )
        }
        return tables;
    }

    return (

        <Grid padded>

            <Grid.Column width={16}>
                <Header as="h1"> Redux State Debug View </Header>
                {mapReduxStateToTable()}
            </Grid.Column>

            <Grid.Column width={16}>
                <DebugActionPanel/>
            </Grid.Column>

        </Grid>

    )

}

const stateMap = state => ({ redux: { userState: state.user, modalState: state.modal, configState: state.config } });
export default connect(stateMap)(StateViewer);