import React from 'react';
import { Header, Segment } from 'semantic-ui-react';

export default function Datastores() {
    return (
        <Segment placeholder className="bg-white m-0 border-solid border border-gray-300 rounded-b border-t-0 rounded-tr-none rounded-tl-none">

            <Header icon className="m-0">
                No datastores were found.
            </Header>

        </Segment>
    );
}
