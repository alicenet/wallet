import { useSelector } from "react-redux";
import { Table, Grid, Header, Segment } from "semantic-ui-react";

export default function ReduxState() {

    const redux = useSelector(s => s);

    console.log(redux);

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
                        <Table.Cell>{typeof redux[reducer][key] !== "object" ? String(redux[reducer][key]) : 'object'}</Table.Cell>
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
            </Segment>
            <Segment>
                <Grid>
                    {mapReduxStateToTable()}
                </Grid>
            </Segment>
        </div>
    )

}