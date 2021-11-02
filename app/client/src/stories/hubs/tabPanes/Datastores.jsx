import React from 'react';
import { Header, Segment } from 'semantic-ui-react';

export default function Datastores({ wallet }) {
    return (
        <Segment placeholder className="m-0 mt-4">
            <Header icon>
                No datastores were found.
            </Header>
        </Segment>
    );
}
