import React from 'react';
import { useSelector, useDispatch } from "react-redux";
import { loadEnvValues } from 'redux/actions/configuration';
import { Table, Grid, Header, Segment, Button } from 'semantic-ui-react';
import { classNames } from "util/generic";

export default function ReduxState() {

    const redux = useSelector(s => s);
    const dispatch = useDispatch();

    const mapReduxStateToTable = () => {

        // Create array of all reducers as a table
        let tables = [];

        // Isolate reducers within connected redux state
        for (let reducer in redux) {
            let rows = [];
            // Isolate the keys of each state, ignore nesting and label as object for now -- Improve i/when f needed
            for (let key in redux[reducer]) {
                rows.push(
                    <Table.Row key={key}>
                        <Table.Cell>{key}</Table.Cell>
                        <Table.Cell
                            className={classNames({ "cursor-pointer hover:text-blue-500 ": typeof redux[reducer][key] === "object" })}
                            onClick={typeof redux[reducer][key] === "object" ? () => console.log(redux[reducer][key]) : null}
                        >
                            {typeof redux[reducer][key] !== "object" ? String(redux[reducer][key]) : 'object (click=>print)'}
                        </Table.Cell>
                    </Table.Row>
                )
            }
            // Add the table
            tables.push(
                <Table key={reducer} size="small">
                    <Table.Header>
                        <Table.Row>
                            <Table.Cell>
                                <Header as="h3">{reducer}</Header>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {rows}
                    </Table.Body>
                </Table>
            )
        }

        tables = tables.map(table => <Grid.Column width={16}>{table}</Grid.Column>)

        return tables;
    }

    return (

        <div>
            <Segment>
                <Header as="h2"> Redux State Debug View </Header>
                <Button small onClick={() => { dispatch(loadEnvValues()) }}>Load ENV Config</Button>
            </Segment>
            <Segment>
                <Grid>
                    {mapReduxStateToTable()}
                </Grid>
            </Segment>
        </div>
    )

}
